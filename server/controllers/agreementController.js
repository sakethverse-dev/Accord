const crypto = require('crypto');
const Agreement = require('../models/Agreement');
const User = require('../models/User');
const { SAMPLE_CONTRACT, parseRawContractText } = require('../services/clauseExtractor');
const { evaluateClause } = require('../services/policyEngine');
const { calculateAgreementRisk } = require('../services/riskCalculator');
const { verifyDocumentIntegrity } = require('../services/cryptoSeal');
const { reconcileDrafts, reconcileDraftsAsync, ORGANIZATION_COUNTER_DRAFT } = require('../services/clauseReconciliation');
const { auditDraftWithAI } = require('../services/geminiAiService');

// @desc    Create a new agreement or load demo contract
// @route   POST /api/agreements
// @access  Private
const createAgreement = async (req, res, next) => {
  try {
    const { title, rawText, useSample } = req.body;
    const user = await User.findById(req.user._id);

    let agreementTitle = title || 'Software Development Services Agreement';
    let auditedClauses = [];
    let initialScore = 80;

    if (!useSample && rawText && rawText.trim() !== '') {
      // Rule-Free AI Dynamic Audit
      try {
        const aiAudit = await auditDraftWithAI(rawText, user?.role || 'freelancer');
        if (aiAudit && Array.isArray(aiAudit.clauses) && aiAudit.clauses.length > 0) {
          if (aiAudit.title && !title) agreementTitle = aiAudit.title;
          auditedClauses = aiAudit.clauses.map((c, idx) => ({
            clauseId: `clause-${idx + 1}`,
            sectionNumber: c.sectionNumber || `Section ${idx + 1}`,
            title: c.title || `Clause ${idx + 1}`,
            category: c.category || 'GENERAL',
            originalText: c.currentText || '',
            currentText: c.currentText || '',
            partyAText: c.currentText || '',
            partyBText: '',
            hasDraftConflict: false,
            diffTokens: [],
            riskLevel: c.riskLevel || 'SAFE',
            riskReason: c.riskReason || '',
            suggestedReplacement: c.suggestedReplacement || '',
            status: 'ORIGINAL',
          }));
        }
      } catch (err) {
        console.warn('[CreateAgreement] Gemini AI audit error, using fallback:', err.message);
      }
    }

    // Fallback or Sample if AI audit did not produce clauses
    if (auditedClauses.length === 0) {
      let rawClauses = [];
      if (useSample) {
        agreementTitle = SAMPLE_CONTRACT.title;
        rawClauses = JSON.parse(JSON.stringify(SAMPLE_CONTRACT.clauses));
      } else if (rawText && rawText.trim() !== '') {
        rawClauses = parseRawContractText(rawText);
      } else {
        agreementTitle = SAMPLE_CONTRACT.title;
        rawClauses = JSON.parse(JSON.stringify(SAMPLE_CONTRACT.clauses));
      }

      auditedClauses = rawClauses.map((clause) => {
        const evaluation = evaluateClause(clause, user.policyProfile, null);
        return {
          ...clause,
          category: evaluation.category,
          riskLevel: evaluation.riskLevel,
          riskReason: evaluation.riskReason,
          suggestedReplacement: evaluation.suggestedReplacement,
          status: 'ORIGINAL',
        };
      });
    }

    // Calculate overall risk score
    const riskMetrics = calculateAgreementRisk(auditedClauses);


    const inviteToken = crypto.randomBytes(8).toString('hex');
    const initialDraftText = rawText || rawClauses.map((c) => `${c.sectionNumber || ''} ${c.title}\n${c.currentText}`).join('\n\n');

    const agreement = await Agreement.create({
      title: agreementTitle,
      creator: req.user._id,
      inviteToken,
      status: 'AUDITED',
      alignmentScore: riskMetrics.alignmentScore,
      criticalRiskCount: riskMetrics.criticalRiskCount,
      warningRiskCount: riskMetrics.warningRiskCount,
      clauses: auditedClauses,
      partyADraft: {
        text: initialDraftText,
        title: agreementTitle,
        submittedAt: new Date(),
      },
      partyBDraft: {
        text: '',
        title: '',
      },
      differences: [],
      proposals: [],
      signatures: [],
      auditLogs: [
        {
          action: 'AGREEMENT_CREATED',
          performedBy: req.user.name,
          performedByRole: req.user.role,
          timestamp: new Date(),
          details: `Agreement created with ${auditedClauses.length} clauses. Initial Risk Score: ${riskMetrics.alignmentScore}% (${riskMetrics.criticalRiskCount} Critical, ${riskMetrics.warningRiskCount} Warnings).`,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all agreements for logged in user
// @route   GET /api/agreements
// @access  Private
const getAgreements = async (req, res, next) => {
  try {
    const agreements = await Agreement.find({
      $or: [{ creator: req.user._id }, { invitedParty: req.user._id }],
    })
      .populate('creator', 'name email role companyOrTitle')
      .populate('invitedParty', 'name email role companyOrTitle')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: agreements.length,
      data: agreements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single agreement by ID (or invite token link)
// @route   GET /api/agreements/:id
// @access  Private
const getAgreementById = async (req, res, next) => {
  try {
    const agreement = await Agreement.findById(req.params.id)
      .populate('creator', 'name email role companyOrTitle policyProfile')
      .populate('invitedParty', 'name email role companyOrTitle policyProfile');

    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement room not found.' });
    }

    const userId = req.user._id.toString();
    const creatorId = agreement.creator._id.toString();
    const invitedPartyId = agreement.invitedParty ? agreement.invitedParty._id.toString() : null;

    // Check if user is creator
    const isCreator = userId === creatorId;
    // Check if user is already invitedParty
    const isInvitedParty = userId === invitedPartyId;

    // If there is no invitedParty yet, and the current user is not creator, automatically link them!
    if (!isCreator && !invitedPartyId) {
      agreement.invitedParty = req.user._id;
      agreement.auditLogs.push({
        action: 'PARTY_JOINED_ROOM',
        performedBy: req.user.name,
        performedByRole: req.user.role,
        timestamp: new Date(),
        details: `${req.user.name} (${req.user.role}) joined the agreement room.`,
      });
      await agreement.save();
      await agreement.populate('invitedParty', 'name email role companyOrTitle policyProfile');
    } else if (!isCreator && !isInvitedParty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not an authorized party in this agreement room.',
      });
    }

    res.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join agreement room via invite token
// @route   POST /api/agreements/join/:token
// @access  Private
const joinByToken = async (req, res, next) => {
  try {
    const agreement = await Agreement.findOne({ inviteToken: req.params.token })
      .populate('creator', 'name email role companyOrTitle');

    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Invalid or expired room invite link.' });
    }

    if (agreement.creator._id.toString() === req.user._id.toString()) {
      return res.json({ success: true, data: agreement });
    }

    if (!agreement.invitedParty) {
      agreement.invitedParty = req.user._id;
      agreement.auditLogs.push({
        action: 'PARTY_JOINED_ROOM',
        performedBy: req.user.name,
        performedByRole: req.user.role,
        timestamp: new Date(),
        details: `${req.user.name} (${req.user.role}) connected to the agreement room via secure invite.`,
      });
      await agreement.save();
    }

    res.json({
      success: true,
      data: agreement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify cryptographic tamper-evident seal
// @route   GET /api/agreements/:id/verify-seal
// @access  Private
const verifySeal = async (req, res, next) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    const verificationResult = verifyDocumentIntegrity(agreement);
    res.json({
      success: true,
      data: verificationResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit counterparty draft and run AI multi-draft reconciliation
// @route   POST /api/agreements/:id/compare-drafts
// @access  Private
const compareDrafts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { draftText, useSampleCounter } = req.body;

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    // STRICT IMMUTABILITY CHECK: Once any signature is recorded, neither party can update!
    if (agreement.status === 'FULLY_EXECUTED_LOCKED' || (agreement.signatures && agreement.signatures.length > 0)) {
      return res.status(403).json({
        success: false,
        message: 'FORBIDDEN: Contract terms are permanently frozen because signature execution has commenced.',
      });
    }

    const incomingText = useSampleCounter ? ORGANIZATION_COUNTER_DRAFT : (draftText || '');
    if (!incomingText.trim()) {
      return res.status(400).json({ success: false, message: 'Draft text cannot be empty.' });
    }

    const isCreator = agreement.creator.toString() === req.user._id.toString();

    if (!isCreator && !agreement.invitedParty) {
      agreement.invitedParty = req.user._id;
    }

    // Ensure Party A draft has text
    let textA = agreement.partyADraft?.text;
    if (!textA || textA.trim() === '') {
      textA = agreement.clauses.map((c) => `${c.sectionNumber || ''} ${c.title}\n${c.currentText}`).join('\n\n');
      agreement.partyADraft = {
        text: textA,
        title: agreement.title,
        submittedAt: new Date(),
      };
    }

    let textB = incomingText;
    if (isCreator) {
      textA = incomingText;
      agreement.partyADraft.text = incomingText;
      agreement.partyADraft.submittedAt = new Date();
    } else {
      agreement.partyBDraft = {
        text: incomingText,
        title: `${agreement.title} (Counterparty Version)`,
        submittedAt: new Date(),
      };
    }

    // Determine participant roles for contextual AI reasoning
    const creatorUser = await User.findById(agreement.creator);
    const invitedUser = agreement.invitedParty ? await User.findById(agreement.invitedParty) : null;
    const creatorRole = creatorUser?.role || 'freelancer';
    const invitedRole = invitedUser?.role || (creatorRole === 'freelancer' ? 'client' : 'freelancer');

    // Run Gemini AI Multi-Draft Clause Reconciliation Engine
    const reconciled = await reconcileDraftsAsync(textA, textB || textA, creatorRole, invitedRole);

    agreement.clauses = reconciled.clauses;
    agreement.differences = reconciled.differences;

    const riskMetrics = calculateAgreementRisk(agreement.clauses);
    agreement.alignmentScore = reconciled.alignmentScore !== undefined ? reconciled.alignmentScore : riskMetrics.alignmentScore;
    agreement.criticalRiskCount = riskMetrics.criticalRiskCount;
    agreement.warningRiskCount = riskMetrics.warningRiskCount;
    agreement.status = 'IN_NEGOTIATION';

    agreement.auditLogs.push({
      action: 'MULTI_DRAFT_AI_RECONCILED',
      performedBy: req.user.name,
      performedByRole: req.user.role,
      timestamp: new Date(),
      details: `Gemini AI Multi-Draft analysis executed comparing Party A & Party B drafts. ${reconciled.totalDifferences} differing terms detected and balanced compromises generated without fixed rules.`,
    });

    await agreement.save();

    res.json({
      success: true,
      message: `AI analysis complete: ${reconciled.totalDifferences} differences identified with recommended compromises.`,
      data: agreement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAgreement,
  getAgreements,
  getAgreementById,
  joinByToken,
  verifySeal,
  compareDrafts,
};
