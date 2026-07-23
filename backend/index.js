const cookieParser = require('cookie-parser');
const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./db/dbconnection.js');

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5176',
  'https://shinelimosllc.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy: This origin is not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Allow embedding public files (TC PDFs) in iframes from the dev frontend origins
app.use((req, res, next) => {
  // Use Content-Security-Policy frame-ancestors for modern browsers
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' http://localhost:5173 http://localhost:5174 http://localhost:5175"
  );
  // Also clear any existing X-Frame-Options header that might block embedding
  res.removeHeader && res.removeHeader('X-Frame-Options');
  next();
});

// Middleware setup
// Stripe webhook needs raw body for signature verification - MUST be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: '*/*' }));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

// Secure proxy endpoint to stream files from backend/public
// Usage: /public-file?path=uploads/filename.pdf
app.get('/public-file', (req, res) => {
  try {
    const requested = String(req.query.path || '');
    if (!requested) return res.status(400).json({ success: false, message: 'Missing path' });

    // Only allow files inside the uploads folder to prevent traversal
    const normalizedRequested = requested.replace(/^\//, ''); // remove leading slash
    if (!normalizedRequested.startsWith('uploads/')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const fullPath = path.join(__dirname, 'public', normalizedRequested);
    const normalizedFull = path.normalize(fullPath);
    const publicRoot = path.normalize(path.join(__dirname, 'public'));

    // Ensure resolved path is inside the public directory
    if (!normalizedFull.startsWith(publicRoot)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Set permissive embedding headers for the proxied response
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:5173 http://localhost:5174 http://localhost:5175");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Stream file
    return res.sendFile(normalizedFull, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) res.status(404).end();
      }
    });
  } catch (err) {
    console.error('public-file error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route imports and middleware
app.use('/', require('./src/routes/adminvalidation.js'));
// Vehicles routes
app.use('/api', require('./src/routes/vehicles.js'));
// Booking routes
app.use('/api', require('./src/routes/booking.js'));
// Dashboard routes
app.use('/api', require('./src/routes/dashboard.js'));
// Payment routes
app.use('/api', require('./src/routes/payment.js'));

// Setup Socket.IO using the utility
const server = http.createServer(app);
const socketUtil = require('./socket');
const io = socketUtil.init(server);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
});

// Setup view engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// Connect to database and start server
connectDB();

// Initialize cron jobs
const { initNotificationCleanup } = require('./src/utils/cronJobs');
initNotificationCleanup();

server.listen(process.env.PORT || 60000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 60000}`);
});
