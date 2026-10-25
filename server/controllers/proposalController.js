const Agreement = require('../models/Agreement');
const User = require('../models/User');
const { computeWordDiff } = require('../services/diffEngine');
const { evaluateClause } = require('../services/policyEngine');
const { calculateAgreementRisk } = require('../services/riskCalculator');

// @desc    Submit a proposed amendment to a clause
// @route   POST /api/agreements/:id/clauses/:clauseId/propose
// @access  Private
const submitProposal = async (req, res, next) => {
  try {
    const { proposedText, rationale } = req.body;
    const { id: agreementId, clauseId } = req.params;

    if (!proposedText || proposedText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Proposed text cannot be empty.' });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    // STRICT IMMUTABILITY CHECK: Once any party signs, terms are legally frozen
    if (agreement.status === 'FULLY_EXECUTED_LOCKED' || (agreement.signatures && agreement.signatures.length > 0)) {
      return res.status(403).json({
        success: false,
        message: 'FORBIDDEN: A digital signature has already been applied. Contract terms are permanently locked against modifications by either party.',
      });
    }

    const clause = agreement.clauses.find((c) => c.clauseId === clauseId);
    if (!clause) {
      return res.status(404).json({ success: false, message: 'Clause not found in agreement.' });
    }

    const proposalId = `prop-${Date.now()}`;
    const previousText = clause.currentText;

    const newProposal = {
      proposalId,
      clauseId,
      proposedBy: req.user._id,
      proposedByName: req.user.name,
      proposedByRole: req.user.role,
      previousText,
      proposedText: proposedText.trim(),
      rationale: rationale || 'Proposed compromise according to professional safety policy standards.',
      status: 'PENDING',
      createdAt: new Date(),
    };

    agreement.proposals.push(newProposal);
    clause.status = 'PROPOSED';
    agreement.status = 'IN_NEGOTIATION';

    agreement.auditLogs.push({
      action: 'PROPOSAL_SUBMITTED',
      performedBy: req.user.name,
      performedByRole: req.user.role,
      timestamp: new Date(),
      details: `Amendment proposed for "${clause.title}": ${newProposal.rationale}`,
    });

    await agreement.save();

    // Compute diff for immediate response
    const diffTokens = computeWordDiff(previousText, proposedText.trim());

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully.',
      data: {
        proposal: newProposal,
        diffTokens,
        agreementStatus: agreement.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or reject a proposed amendment
// @route   POST /api/agreements/:id/proposals/:proposalId/respond
// @access  Private
const respondToProposal = async (req, res, next) => {
  try {
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const { id: agreementId, proposalId } = req.params;

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be either 'ACCEPT' or 'REJECT'." });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    // STRICT IMMUTABILITY CHECK: Once any party signs, terms are legally frozen
    if (agreement.status === 'FULLY_EXECUTED_LOCKED' || (agreement.signatures && agreement.signatures.length > 0)) {
      return res.status(403).json({
        success: false,
        message: 'FORBIDDEN: Agreement signing has commenced. Modifications are permanently locked for both parties.',
      });
    }

    const proposal = agreement.proposals.find((p) => p.proposalId === proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Proposal has already been ${proposal.status.toLowerCase()}.` });
    }

    const clause = agreement.clauses.find((c) => c.clauseId === proposal.clauseId);
    if (!clause) {
      return res.status(404).json({ success: false, message: 'Associated clause not found.' });
    }

    proposal.respondedAt = new Date();
    proposal.respondedBy = req.user._id;

    if (action === 'ACCEPT') {
      proposal.status = 'ACCEPTED';
      clause.currentText = proposal.proposedText;
      clause.status = 'RESOLVED';

      // Re-evaluate clause risk using creator policy
      const creator = await User.findById(agreement.creator);
      const reEvaluation = evaluateClause(clause, creator?.policyProfile, null);

      clause.riskLevel = reEvaluation.riskLevel;
      clause.riskReason = reEvaluation.riskReason;
      clause.suggestedReplacement = reEvaluation.suggestedReplacement;

      // Recalculate overall agreement risk metrics
      const newRiskMetrics = calculateAgreementRisk(agreement.clauses);
      agreement.alignmentScore = newRiskMetrics.alignmentScore;
      agreement.criticalRiskCount = newRiskMetrics.criticalRiskCount;
      agreement.warningRiskCount = newRiskMetrics.warningRiskCount;

      // If any party had previously signed before this amendment, invalidate prior signatures
      if (agreement.signatures && agreement.signatures.length > 0) {
        agreement.signatures = [];
        agreement.auditLogs.push({
          action: 'SIGNATURES_VOIDED',
          performedBy: req.user.name,
          performedByRole: req.user.role,
          timestamp: new Date(),
          details: 'Previous digital signatures invalidated because agreement terms were amended. Re-execution required.',
        });
      }

      // Check if all proposals resolved & no critical risks remain
      const hasPendingProposals = agreement.proposals.some((p) => p.status === 'PENDING');
      if (!hasPendingProposals && newRiskMetrics.criticalRiskCount === 0) {
        agreement.status = 'ALIGNED';
      }

      agreement.auditLogs.push({
        action: 'PROPOSAL_ACCEPTED',
        performedBy: req.user.name,
        performedByRole: req.user.role,
        timestamp: new Date(),
        details: `Amendment accepted for "${clause.title}". New Alignment Score: ${newRiskMetrics.alignmentScore}%.`,
      });
    } else {
      proposal.status = 'REJECTED';
      clause.status = 'ORIGINAL';

      agreement.auditLogs.push({
        action: 'PROPOSAL_REJECTED',
        performedBy: req.user.name,
        performedByRole: req.user.role,
        timestamp: new Date(),
        details: `Amendment rejected for "${clause.title}". Clause reverted to previous text.`,
      });
    }

    await agreement.save();

    res.json({
      success: true,
      message: `Proposal ${action === 'ACCEPT' ? 'accepted and applied' : 'rejected'}.`,
      data: {
        agreement,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get word-level diff between original and current (or proposed) text
// @route   POST /api/agreements/diff
// @access  Private
const getDiff = async (req, res, next) => {
  try {
    const { oldText, newText } = req.body;
    const diffTokens = computeWordDiff(oldText || '', newText || '');
    res.json({
      success: true,
      data: diffTokens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adopt an AI-recommended compromise directly onto a clause
// @route   POST /api/agreements/:id/clauses/:clauseId/adopt-compromise
// @access  Private
const adoptCompromise = async (req, res, next) => {
  try {
    const { id: agreementId, clauseId } = req.params;
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    // STRICT IMMUTABILITY CHECK
    if (agreement.status === 'FULLY_EXECUTED_LOCKED' || (agreement.signatures && agreement.signatures.length > 0)) {
      return res.status(403).json({
        success: false,
        message: 'FORBIDDEN: Contract terms are legally frozen because a signature has already been recorded.',
      });
    }

    const clause = agreement.clauses.find((c) => c.clauseId === clauseId);
    if (!clause) {
      return res.status(404).json({ success: false, message: 'Clause not found in agreement.' });
    }

    if (!clause.suggestedReplacement) {
      return res.status(400).json({ success: false, message: 'No AI compromise suggested for this clause.' });
    }

    const hasCounterparty = !!agreement.invitedParty;
    const isFirstAdoption = !clause.compromiseAdoptedBy || clause.status !== 'PENDING_CONFIRMATION';

    if (hasCounterparty && isFirstAdoption) {
      // First party adopted the compromise -> mark as PENDING_CONFIRMATION
      clause.currentText = clause.suggestedReplacement;
      clause.status = 'PENDING_CONFIRMATION';
      clause.compromiseAdoptedBy = req.user.name;
      agreement.status = 'IN_NEGOTIATION';

      agreement.auditLogs.push({
        action: 'AI_COMPROMISE_PROPOSED',
        performedBy: req.user.name,
        performedByRole: req.user.role,
        timestamp: new Date(),
        details: `${req.user.name} adopted AI Balanced Compromise for "${clause.title}". Awaiting counterparty confirmation.`,
      });
    } else {
      // Counterparty confirms or no second party yet -> mark as fully RESOLVED
      clause.currentText = clause.suggestedReplacement;
      clause.status = 'RESOLVED';
      clause.riskLevel = 'SAFE';
      clause.hasDraftConflict = false;
      clause.compromiseAdoptedBy = '';

      agreement.auditLogs.push({
        action: 'AI_COMPROMISE_MUTUALLY_AGREED',
        performedBy: req.user.name,
        performedByRole: req.user.role,
        timestamp: new Date(),
        details: `AI Balanced Compromise mutually confirmed for "${clause.title}" by ${req.user.name}. Term successfully resolved.`,
      });
    }

    // Recalculate agreement risk
    const newRiskMetrics = calculateAgreementRisk(agreement.clauses);
    agreement.alignmentScore = newRiskMetrics.alignmentScore;
    agreement.criticalRiskCount = newRiskMetrics.criticalRiskCount;
    agreement.warningRiskCount = newRiskMetrics.warningRiskCount;

    if (newRiskMetrics.criticalRiskCount === 0 && !agreement.clauses.some((c) => c.status === 'PENDING_CONFIRMATION')) {
      agreement.status = 'ALIGNED';
    }

    await agreement.save();

    res.json({
      success: true,
      message: `AI compromise adopted for "${clause.title}".`,
      data: agreement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Use Gemini AI to improve or rewrite a clause based on user instructions
// @route   POST /api/agreements/:id/clauses/:clauseId/ai-improve
// @access  Private
const improveClauseWithAIController = async (req, res, next) => {
  try {
    const { id: agreementId, clauseId } = req.params;
    const { instruction } = req.body;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    const clause = agreement.clauses.find((c) => c.clauseId === clauseId);
    if (!clause) {
      return res.status(404).json({ success: false, message: 'Clause not found in agreement.' });
    }

    const { improveClauseWithAI } = require('../services/geminiAiService');
    const result = await improveClauseWithAI({
      clauseTitle: clause.title,
      currentText: clause.currentText || clause.originalText,
      instruction: instruction || 'Make this clause balanced, fair, and clear for both parties.',
      userRole: req.user.role || 'freelancer',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitProposal,
  respondToProposal,
  getDiff,
  adoptCompromise,
  improveClauseWithAIController,
};

