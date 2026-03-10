import logger from '../config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '../services/users.services.js';
import { userIdSchema, updateUserSchema } from '../validations/users.validation.js';
import { formatValidationErrors } from '../utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users');

    const allUsers = await getAllUsers();

    res.status(200).json({ users: allUsers, count: allUsers.length });
  } catch (error) {
    logger.error('Error getting all users', { error });
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const paramsResult = userIdSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramsResult.error),
      });
    }

    const { id } = paramsResult.data;

    logger.info('Getting user by id', { id });

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'User with the specified ID does not exist' });
    }

    res.status(200).json({ user });
  } catch (error) {
    logger.error('Error getting user by id', { error });
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramsResult.error),
      });
    }

    const bodyResult = updateUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(bodyResult.error),
      });
    }

    const { id } = paramsResult.data;
    const updates = bodyResult.data;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    if (updates.role !== undefined && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admin users can change the role of a user',
      });
    }

    logger.info('Updating user', { id, requestingUserId: req.user.id });

    const updatedUser = await updateUserService(id, updates);

    logger.info('User updated successfully', { id });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    logger.error('Error updating user', { error });

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found', message: 'User with the specified ID does not exist' });
    }

    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramsResult.error),
      });
    }

    const { id } = paramsResult.data;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account. Admins can delete any user.',
      });
    }

    logger.info('Deleting user', { id, requestingUserId: req.user.id });

    await deleteUserService(id);

    logger.info('User deleted successfully', { id });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user', { error });

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found', message: 'User with the specified ID does not exist' });
    }

    next(error);
  }
};