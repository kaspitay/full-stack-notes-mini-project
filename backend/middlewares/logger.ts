import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const body = req.body ? JSON.stringify(req.body) : '';

  const logEntry = `${timestamp} - ${method} ${url} - Body: ${body}\n`;
  
  fs.appendFile(path.join(__dirname, '../log.txt'), logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  next();
}; 