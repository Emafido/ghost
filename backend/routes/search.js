import express from 'express';
import { searchLead } from '../controllers/searchController.js';
import { searchLimiter } from '../middleware/rateLimit.js';
import { validateSearchBody } from '../middleware/validation.js';

const router = express.Router();

router.post('/', searchLimiter, validateSearchBody, searchLead);

export default router;
