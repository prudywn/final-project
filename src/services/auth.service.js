import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';

export const hashPassword = async (password) => {
  try{
    return await bcrypt.hash(password, 10);

  } catch (error) {
    logger.error('Error hashing password', { error });
    throw error;
  }
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Error comparing password', { error });
    throw error;
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return user;
  } catch (error) {
    logger.error('Error authenticating user', { error });
    throw error;
  }
};

export const createUser = async ({ name, email, password, role = 'user'}) => {
  try{
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at, updated_at: users.updated_at});

    logger.info(`User ${email} created successfully`);
    return newUser;

  } catch (error) {
    logger.error('Error creating user', { error });
    throw error;
  }
};