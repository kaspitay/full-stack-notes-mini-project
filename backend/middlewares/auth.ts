import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authorization = req.get('authorization');
  
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
        id: string;
        username: string;
      };
      
      req.user = {
        id: decoded.id,
        username: decoded.username
      };
      
      next();
    } catch (error) {
      const authError: CustomError = new Error('Invalid token');
      authError.status = 401;
      next(authError);
    }
  } else {
    const authError: CustomError = new Error('Authorization token missing');
    authError.status = 401;
    next(authError);
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authorization = req.get('authorization');
  
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
        id: string;
        username: string;
      };
      
      req.user = {
        id: decoded.id,
        username: decoded.username
      };
    } catch (error) {
    }
  }
  
  next();
};

export { AuthenticatedRequest };
