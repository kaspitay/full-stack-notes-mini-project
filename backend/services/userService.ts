import User, { IUser } from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CustomError } from '../middlewares/errorHandler';
import { Types } from 'mongoose';

export const createUser = async (userData: {
  name: string;
  email: string;
  username: string;
  password: string;
}): Promise<IUser> => {
  const { name, email, username, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    const error: CustomError = new Error('Username already exists');
    error.status = 400;
    throw error;
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = new User({
    name,
    email,
    username,
    passwordHash
  });

  await user.save();
  return user;
};

export const loginUser = async (credentials: {
  username: string;
  password: string;
}): Promise<{ token: string; user: { id: string; name: string; email: string; username: string } }> => {
  const { username, password } = credentials;

  const user = await User.findOne({ username });
  if (!user) {
    const error: CustomError = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    const error: CustomError = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Create token
  const payload = {
    username: user.username,
    id: user._id
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });

  return {
    token,
    user: {
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      email: user.email,
      username: user.username
    }
  };
};
