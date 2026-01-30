import express from 'express';
import blockchainController from '../controllers/blockchainController.js';
import {
	validateWalletParam,
	validateDeductBody,
	validateRecordBody,
	validateBuyCreditsBody,
} from '../middleware/validation.js';

const router = express.Router();

// Public mock endpoints for blockchain interactions
router.get('/credits/:wallet', validateWalletParam, blockchainController.getCredits);
router.get('/history/:wallet', validateWalletParam, blockchainController.getHistory);
router.get('/badges/:wallet', validateWalletParam, blockchainController.getBadges);
router.get('/reputation/:wallet', validateWalletParam, blockchainController.getReputation);

// Actions (mock)
router.post('/deduct', validateDeductBody, blockchainController.deductCredit);
router.post('/record', validateRecordBody, blockchainController.recordSearch);
router.post('/buy-credits', validateBuyCreditsBody, blockchainController.buyCredits);

export default router;
