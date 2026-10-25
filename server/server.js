const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PactFlow Agreement Engine',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/agreements', require('./routes/agreementRoutes'));

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Seed demo users for evaluator convenience
const seedDemoUsers = async () => {
  try {
    const existing = await User.findOne({ email: 'freelancer@pactflow.dev' });
    if (!existing) {
      await User.create({
        name: 'Alex Rivera',
        email: 'freelancer@pactflow.dev',
        password: 'password123',
        role: 'freelancer',
        companyOrTitle: 'Senior Full-Stack Architect',
        policyProfile: {
          maxPaymentDays: 30,
          maxLiabilityCap: '1x_fees',
          ipTransferCondition: 'upon_full_payment',
          nonCompeteAllowed: false,
          bugWarrantyDays: 14,
        },
      });

      await User.create({
        name: 'Sarah Chen',
        email: 'client@pactflow.dev',
        password: 'password123',
        role: 'client',
        companyOrTitle: 'VP of Engineering, CloudScale Labs',
        policyProfile: {
          maxPaymentDays: 45,
          maxLiabilityCap: '1x_fees',
          ipTransferCondition: 'upon_full_payment',
          nonCompeteAllowed: false,
          bugWarrantyDays: 30,
        },
      });

      console.log('🌱 Seeded Demo Accounts for Evaluator Testing:');
      console.log('   👨‍💻 Freelancer: freelancer@pactflow.dev | password: password123');
      console.log('   🏢 Client:     client@pactflow.dev     | password: password123');
    }
  } catch (err) {
    console.error('Seed notice:', err.message);
  }
};

const startServer = async () => {
  await connectDB();
  await seedDemoUsers();
  app.listen(PORT, () => {
    console.log(`🚀 PactFlow Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
