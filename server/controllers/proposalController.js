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

    // IMMUTABILITY CHECK
    if (agreement.status === 'FULLY_EXECUTED_LOCKED') {
      return res.status(403).json({
        success: false,
        message: 'FORBIDDEN: This agreement has been signed by both parties and is permanently locked against modifications.',
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

    // IMMUTABILITY CHECK
    if (agreement.status === 'FULLY_EXECUTED_LOCKED') {
      return res.status(403).json({
        success: false,
        message: 'FORBIDDEN: Agreement is fully executed and cannot be modified.',
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

module.exports = {
  submitProposal,
  respondToProposal,
  getDiff,
};
