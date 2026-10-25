const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const policySchema = new mongoose.Schema({
  maxPaymentDays: {
    type: Number,
    default: 30, // Net-30 default
  },
  maxLiabilityCap: {
    type: String,
    enum: ['1x_fees', 'fixed_amount', 'unlimited_never'],
    default: '1x_fees', // Liability should not exceed 100% of fees paid
  },
  ipTransferCondition: {
    type: String,
    enum: ['upon_full_payment', 'immediate_on_delivery', 'retained_by_creator'],
    default: 'upon_full_payment', // Ownership only transfers after final payment
  },
  nonCompeteAllowed: {
    type: Boolean,
    default: false, // Refuses predatory non-compete clauses by default
  },
  bugWarrantyDays: {
    type: Number,
    default: 14, // 14-day standard bug-fix warranty
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full legal name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['freelancer', 'client'],
    default: 'freelancer',
  },
  companyOrTitle: {
    type: String,
    default: 'Independent Contractor',
  },
  policyProfile: {
    type: policySchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
