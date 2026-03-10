import express from 'express';
import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/',fetchAllUsers);
router.get('/:id', getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

export default router;