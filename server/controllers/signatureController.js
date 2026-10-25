const Agreement = require('../models/Agreement');
const { generateDocumentSeal } = require('../services/cryptoSeal');

// @desc    Electronically sign agreement with legal intent declaration
// @route   POST /api/agreements/:id/sign
// @access  Private
const signAgreement = async (req, res, next) => {
  try {
    const { signerName, affirmationChecked, signatureImage } = req.body;
    const { id: agreementId } = req.params;

    if (!affirmationChecked) {
      return res.status(400).json({
        success: false,
        message: 'Legal affirmation is required to execute this agreement.',
      });
    }

    if (!signerName || signerName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Full legal signer name is required.',
      });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    // Check if agreement is already locked
    if (agreement.status === 'FULLY_EXECUTED_LOCKED') {
      return res.status(400).json({
        success: false,
        message: 'Agreement has already been fully executed and locked.',
      });
    }

    // Check if this specific user has already signed
    const alreadySigned = agreement.signatures.some(
      (s) => s.signedBy.toString() === req.user._id.toString()
    );
    if (alreadySigned) {
      return res.status(400).json({
        success: false,
        message: 'You have already signed this agreement.',
      });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const clientUserAgent = req.headers['user-agent'] || 'Standard Web Browser';

    const signatureRecord = {
      signedBy: req.user._id,
      signerName: signerName.trim(),
      signerRole: req.user.role,
      signerEmail: req.user.email,
      legalAffirmationText: 'I hereby declare under penalty of perjury that I have reviewed all terms, and I intend this electronic signature to be legally binding.',
      signatureImage: signatureImage || '',
      signedAt: new Date(),
      ipAddress: clientIp,
      userAgent: clientUserAgent,
    };

    agreement.signatures.push(signatureRecord);

    agreement.auditLogs.push({
      action: 'SIGNATURE_RECORDED',
      performedBy: req.user.name,
      performedByRole: req.user.role,
      timestamp: new Date(),
      details: `Digitally signed by ${signerName.trim()} (${req.user.email}) from IP ${clientIp}.`,
    });

    // Check if both parties have signed (or at least 2 signatures)
    if (agreement.signatures.length >= 2) {
      agreement.status = 'FULLY_EXECUTED_LOCKED';

      // Apply Cryptographic SHA-256 Seal
      const sealData = generateDocumentSeal(agreement);
      agreement.cryptoSeal = sealData;

      agreement.auditLogs.push({
        action: 'CRYPTO_SEAL_APPLIED',
        performedBy: 'PactFlow Security Engine',
        performedByRole: 'system',
        timestamp: new Date(),
        details: `Cryptographic SHA-256 seal generated: [${sealData.sha256Hash}]. Agreement is permanently locked and tamper-evident.`,
      });
    } else {
      agreement.status = 'PARTIALLY_SIGNED';
    }

    await agreement.save();

    res.json({
      success: true,
      message: agreement.status === 'FULLY_EXECUTED_LOCKED'
        ? 'Agreement successfully signed by both parties and cryptographically sealed!'
        : 'Your signature has been recorded. Awaiting counter-party signature.',
      data: agreement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signAgreement };
