import { authenticate } from './auth.middleware.js';

export const requireAdmin = async (req, res, next) => {
  await authenticate(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Only admin users can access this resource' });
    }
    next();
  });
};