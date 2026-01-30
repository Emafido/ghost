import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: security and parsing
app.use(helmet());

// Tighten CORS: allow FRONTEND_ORIGIN or default localhost:3000
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (curl, Postman) when origin is undefined
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('CORS policy: origin not allowed'));
    },
    optionsSuccessStatus: 200,
  })
);

// Limit JSON body size to mitigate large payload abuse
app.use(express.json({ limit: '10kb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghost')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Ghost Backend API Running');
});

// Routes
import searchRouter from './routes/search.js';
app.use('/api/search', searchRouter);
import regenerateRouter from './routes/regenerate.js';
app.use('/api/search/regenerate', regenerateRouter);
import blockchainRouter from './routes/blockchain.js';
app.use('/api', blockchainRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
