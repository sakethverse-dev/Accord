const express = require('express');
const router = express.Router();
const {
  createAgreement,
  getAgreements,
  getAgreementById,
  joinByToken,
  verifySeal,
} = require('../controllers/agreementController');
const {
  submitProposal,
  respondToProposal,
  getDiff,
} = require('../controllers/proposalController');
const { signAgreement } = require('../controllers/signatureController');
const { protect } = require('../middleware/authMiddleware');

// Agreement CRUD & Ingestion
router.route('/')
  .post(protect, createAgreement)
  .get(protect, getAgreements);

router.get('/:id', protect, getAgreementById);
router.post('/join/:token', protect, joinByToken);
router.get('/:id/verify-seal', protect, verifySeal);

// Negotiation & Proposals
router.post('/:id/clauses/:clauseId/propose', protect, submitProposal);
router.post('/:id/proposals/:proposalId/respond', protect, respondToProposal);
router.post('/diff', protect, getDiff);

// Digital Signatures
router.post('/:id/sign', protect, signAgreement);

module.exports = router;
