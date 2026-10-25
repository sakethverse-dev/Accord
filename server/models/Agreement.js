const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema({
  clauseId: {
    type: String,
    required: true,
  },
  sectionNumber: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['PAYMENT', 'LIABILITY', 'IP_OWNERSHIP', 'NON_COMPETE', 'WARRANTY', 'TERMINATION', 'GENERAL'],
    default: 'GENERAL',
  },
  originalText: {
    type: String,
    required: true,
  },
  currentText: {
    type: String,
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ['SAFE', 'WARNING', 'CRITICAL'],
    default: 'SAFE',
  },
  riskReason: {
    type: String,
    default: '',
  },
  suggestedReplacement: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['ORIGINAL', 'PROPOSED', 'RESOLVED', 'OVERRIDDEN'],
    default: 'ORIGINAL',
  },
}, { _id: false });

const proposalSchema = new mongoose.Schema({
  proposalId: {
    type: String,
    required: true,
  },
  clauseId: {
    type: String,
    required: true,
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proposedByName: {
    type: String,
    required: true,
  },
  proposedByRole: {
    type: String,
    enum: ['freelancer', 'client'],
    required: true,
  },
  previousText: {
    type: String,
    required: true,
  },
  proposedText: {
    type: String,
    required: true,
  },
  rationale: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });

const signatureSchema = new mongoose.Schema({
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  signerName: {
    type: String,
    required: true,
  },
  signerRole: {
    type: String,
    required: true,
  },
  signerEmail: {
    type: String,
    required: true,
  },
  legalAffirmationText: {
    type: String,
    required: true,
  },
  signedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: 'Unknown Browser',
  },
  signatureImage: {
    type: String,
    default: '',
  },
}, { _id: false });

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
  performedByRole: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: String,
    required: true,
  },
}, { _id: false });

const agreementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an agreement title'],
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invitedParty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  inviteToken: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'AUDITED', 'IN_NEGOTIATION', 'ALIGNED', 'PARTIALLY_SIGNED', 'FULLY_EXECUTED_LOCKED'],
    default: 'DRAFT',
  },
  alignmentScore: {
    type: Number,
    default: 100, // 0 to 100
  },
  criticalRiskCount: {
    type: Number,
    default: 0,
  },
  warningRiskCount: {
    type: Number,
    default: 0,
  },
  clauses: [clauseSchema],
  proposals: [proposalSchema],
  signatures: [signatureSchema],
  cryptoSeal: {
    sha256Hash: { type: String, default: null },
    sealedAt: { type: Date, default: null },
    isTamperVerified: { type: Boolean, default: false },
  },
  auditLogs: [auditLogSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
agreementSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Agreement', agreementSchema);
