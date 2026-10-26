const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pactflow_dev_super_secret_jwt_key_change_in_production_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, companyOrTitle, policyProfile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'freelancer',
      companyOrTitle: companyOrTitle || (role === 'client' ? 'Hiring Enterprise' : 'Independent Contractor'),
      policyProfile: policyProfile || {},
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyOrTitle: user.companyOrTitle,
        policyProfile: user.policyProfile,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyOrTitle: user.companyOrTitle,
        policyProfile: user.policyProfile,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user's safety policy profile
// @route   PUT /api/auth/policy
// @access  Private
const updatePolicyProfile = async (req, res, next) => {
  try {
    const { maxPaymentDays, maxLiabilityCap, ipTransferCondition, nonCompeteAllowed, bugWarrantyDays } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.policyProfile = {
      maxPaymentDays: maxPaymentDays !== undefined ? Number(maxPaymentDays) : user.policyProfile.maxPaymentDays,
      maxLiabilityCap: maxLiabilityCap || user.policyProfile.maxLiabilityCap,
      ipTransferCondition: ipTransferCondition || user.policyProfile.ipTransferCondition,
      nonCompeteAllowed: nonCompeteAllowed !== undefined ? Boolean(nonCompeteAllowed) : user.policyProfile.nonCompeteAllowed,
      bugWarrantyDays: bugWarrantyDays !== undefined ? Number(bugWarrantyDays) : user.policyProfile.bugWarrantyDays,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Policy profile updated successfully.',
      data: user.policyProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & password
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, companyOrTitle, avatarUrl, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (companyOrTitle !== undefined) {
      user.companyOrTitle = companyOrTitle.trim();
    }
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl.trim();
    }

    // If changing password
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to verify your identity before setting a new password.',
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match our records.',
        });
      }

      if (newPassword.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      user.password = newPassword.trim();
    }

    await user.save();

    const sanitizedUser = await User.findById(user._id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: sanitizedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updatePolicyProfile,
  updateUserProfile,
};
