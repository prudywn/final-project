import logger from '../config/logger.js';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
import { hashPassword } from './auth.service.js';

const userSelectFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select(userSelectFields)
      .from(users);

    return allUsers;
  } catch (error) {
    logger.error('Error getting all users', { error });
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db
      .select(userSelectFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  } catch (error) {
    logger.error('Error getting user by id', { id, error });
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const updateData = { ...updates, updated_at: new Date() };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning(userSelectFields);

    return updatedUser;
  } catch (error) {
    logger.error('Error updating user', { id, error });
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
    return true;
  } catch (error) {
    logger.error('Error deleting user', { id, error });
    throw error;
  }
};