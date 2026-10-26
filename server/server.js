const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables (support server/.env as well as root .env)
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();

// 1. Security Headers via Helmet (relaxed CSP & COEP for SPA external assets/fonts)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// 2. Prevent NoSQL Injection attacks by sanitizing request bodies & query params
app.use(mongoSanitize());

// 3. CORS Configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, ''))
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow direct browser navigation, server-to-server, and same-origin assets
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // 2. Automatically allow any Render deployment (*.onrender.com) or Vercel deployment (*.vercel.app)
    if (cleanOrigin.endsWith('.onrender.com') || cleanOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 3. Allow local dev environments
    if (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // 4. Allow explicitly configured CLIENT_URL
    if (allowedOrigins.length > 0 && allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // 5. Allow in non-production
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error(`Blocked by CORS policy: ${origin} not permitted`));
  },
  credentials: true,
}));

// 4. Body parser with strict payload limits (prevent memory exhaust DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Rate Limiting Protection
// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' },
});
app.use('/api', generalLimiter);

// Strict Authentication Rate Limiter (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // max 30 login/register attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoints (matches Student Deployment Guide Section 7)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Accord Agreement & Risk Consensus Engine',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/agreements', require('./routes/agreementRoutes'));

// Serve static frontend assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      if (path.extname(req.path)) {
        return next();
      }
      return res.sendFile(path.resolve(distPath, 'index.html'));
    }
    next();
  });
}

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Accord Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();

