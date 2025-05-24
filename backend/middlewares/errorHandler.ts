import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  
  console.error(`[Error] ${err.message}`);
  
  res.status(status).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      status
    }
  });
}; 