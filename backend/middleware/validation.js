import { param, body, validationResult } from 'express-validator';

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const validateWalletParam = [
  param('wallet').exists().withMessage('wallet param required').bail().matches(ethAddressRegex).withMessage('invalid wallet format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateDeductBody = [
  body('wallet').exists().withMessage('wallet required').bail().matches(ethAddressRegex).withMessage('invalid wallet'),
  body('amount').optional().isInt({ gt: 0 }).withMessage('amount must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateRecordBody = [
  body('wallet').exists().withMessage('wallet required').bail().matches(ethAddressRegex).withMessage('invalid wallet'),
  body('search').exists().withMessage('search required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateBuyCreditsBody = [
  body('wallet').exists().withMessage('wallet required').bail().matches(ethAddressRegex).withMessage('invalid wallet'),
  body('amount').exists().withMessage('amount required').bail().isInt({ gt: 0 }).withMessage('amount must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateSearchBody = [
  body('linkedinUrl').exists().withMessage('linkedinUrl required').bail().isURL().withMessage('invalid URL'),
  body('wallet').optional().matches(ethAddressRegex).withMessage('invalid wallet'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateRegenerateBody = [
  body('id').exists().withMessage('id required').bail().isMongoId().withMessage('invalid id'),
  body('wallet').optional().matches(ethAddressRegex).withMessage('invalid wallet'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export default {};
