import rateLimit from 'express-rate-limit';

function keyFromReq(req) {
  // prefer wallet address if provided, fallback to IP
  return (req.body && req.body.wallet) || req.params?.wallet || req.ip;
}

export const createLimiter = ({ windowMs = 60 * 1000, max = 10 } = {}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyFromReq,
  });

// common limiters
export const searchLimiter = createLimiter({ windowMs: 60 * 1000, max: 10 });
export const regenerateLimiter = createLimiter({ windowMs: 60 * 1000, max: 5 });
