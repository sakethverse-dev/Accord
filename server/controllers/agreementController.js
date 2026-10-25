const crypto = require('crypto');
const Agreement = require('../models/Agreement');
const User = require('../models/User');
const { SAMPLE_CONTRACT, parseRawContractText } = require('../services/clauseExtractor');
const { evaluateClause } = require('../services/policyEngine');
const { calculateAgreementRisk } = require('../services/riskCalculator');
const { verifyDocumentIntegrity } = require('../services/cryptoSeal');

// @desc    Create a new agreement or load demo contract
// @route   POST /api/agreements
// @access  Private
const createAgreement = async (req, res, next) => {
  try {
    const { title, rawText, useSample } = req.body;

    let agreementTitle = title || 'Software Development Services Agreement';
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

    // Run deterministic policy audit on each clause
    const user = await User.findById(req.user._id);
    const auditedClauses = rawClauses.map((clause) => {
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

    // Calculate overall risk score
    const riskMetrics = calculateAgreementRisk(auditedClauses);

    const inviteToken = crypto.randomBytes(8).toString('hex');

    const agreement = await Agreement.create({
      title: agreementTitle,
      creator: req.user._id,
      inviteToken,
      status: 'AUDITED',
      alignmentScore: riskMetrics.alignmentScore,
      criticalRiskCount: riskMetrics.criticalRiskCount,
      warningRiskCount: riskMetrics.warningRiskCount,
      clauses: auditedClauses,
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

module.exports = {
  createAgreement,
  getAgreements,
  getAgreementById,
  joinByToken,
  verifySeal,
};
