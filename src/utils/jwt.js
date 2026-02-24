import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const JWT_EXPIRATION = '1d'; // Token expires in 1 day

export const jwttoken = {
  sign: (payload) => {
    try{
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      logger.error('Error signing JWT token', { error });
      throw new Error('Failed to sign JWT token', { cause: error });
    }
  },
  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying JWT token', { error });
      throw new Error('Failed to verify JWT token', { cause: error });
    }
  }
};