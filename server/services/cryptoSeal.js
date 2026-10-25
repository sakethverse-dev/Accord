const crypto = require('crypto');

/**
 * PactFlow Cryptographic Tamper-Evident Seal Service
 * Generates and validates SHA-256 document checksums according to e-signature integrity standards
 */

function buildCanonicalRepresentation(agreement) {
  const normalizedClauses = (agreement.clauses || []).map((c) => ({
    clauseId: c.clauseId,
    sectionNumber: c.sectionNumber || '',
    title: c.title,
    text: (c.currentText || '').trim(),
  }));

  const normalizedSignatures = (agreement.signatures || []).map((s) => ({
    signerName: (s.signerName || '').trim(),
    signerEmail: (s.signerEmail || '').toLowerCase().trim(),
    signerRole: s.signerRole,
    signedAt: s.signedAt ? new Date(s.signedAt).toISOString() : '',
    legalAffirmationText: (s.legalAffirmationText || '').trim(),
  }));

  return JSON.stringify({
    agreementId: agreement._id.toString(),
    title: (agreement.title || '').trim(),
    clauses: normalizedClauses,
    signatures: normalizedSignatures,
  });
}

function generateDocumentSeal(agreement) {
  const canonicalData = buildCanonicalRepresentation(agreement);
  const sha256Hash = crypto.createHash('sha256').update(canonicalData).digest('hex');

  return {
    sha256Hash,
    sealedAt: new Date(),
    isTamperVerified: true,
  };
}

function verifyDocumentIntegrity(agreement) {
  if (!agreement.cryptoSeal || !agreement.cryptoSeal.sha256Hash) {
    return {
      isVerified: false,
      reason: 'No cryptographic seal exists on this agreement.',
    };
  }

  const canonicalData = buildCanonicalRepresentation(agreement);
  const calculatedHash = crypto.createHash('sha256').update(canonicalData).digest('hex');

  const isMatch = calculatedHash === agreement.cryptoSeal.sha256Hash;

  return {
    isVerified: isMatch,
    storedHash: agreement.cryptoSeal.sha256Hash,
    calculatedHash,
    reason: isMatch ? 'Document integrity verified. Cryptographic seal is intact.' : 'TAMPER DETECTED: Document content or signatures have been modified since seal was applied.',
  };
}

module.exports = {
  generateDocumentSeal,
  verifyDocumentIntegrity,
};
