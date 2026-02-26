import { slidingWindow } from '@arcjet/node';
import aj from '../config/arcject.js';
import logger from '../config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try{
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceeded';
        break;
      default:
        limit = 5;
        message = 'Guest request limit exceeded';
    }

    const client = aj.withRule(slidingWindow({mode: 'LIVE', interval: '1m', max: limit, name: `${role}-rate-limit`}));

    const decision = await client.protect(req, { requested: 1 });
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot detected', { ip: req.ip, userAgent: req.headers['user-agent'], path: req.path });
      return res.status(403).json({ error: 'Forbidden', message: 'Bot detected' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield blocked request', { ip: req.ip, userAgent: req.headers['user-agent'], path: req.path });
      return res.status(403).json({ error: 'Forbidden', message: 'Shield blocked request' });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', { ip: req.ip, userAgent: req.headers['user-agent'], path: req.path });
      return res.status(429).json({ error: 'Forbidden', message });
    }

    next();
  }catch (e) {
    console.error('Error in security middleware', e);
    return res.status(500).json({ error: 'Internal server error', message: 'An error occurred while processing the request' });
  }
};

export default securityMiddleware;