import express from 'express';
import { regenerateOpener } from '../controllers/regenerateController.js';
import { regenerateLimiter } from '../middleware/rateLimit.js';
import { validateRegenerateBody } from '../middleware/validation.js';

const router = express.Router();

router.post('/', regenerateLimiter, validateRegenerateBody, regenerateOpener);

export default router;
