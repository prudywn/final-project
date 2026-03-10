import { cookies } from '../utils/cookies.js';
import { jwttoken } from '../utils/jwt.js';
import logger from '../config/logger.js';

export const authenticate = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const decoded = jwttoken.verify(token);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};
