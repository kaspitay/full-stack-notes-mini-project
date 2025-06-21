import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    const user = await userService.createUser({ name, email, username, password });
    
    // Return user without password hash
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username
    });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const result = await userService.loginUser({ username, password });
    res.status(200).json(result);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
