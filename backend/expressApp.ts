import express, { Express } from 'express';
import cors from 'cors';
import 'express-async-errors';
import routes from './routes';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';

const createApp = (): Express => {
  const app = express();

  app.use(cors({
    exposedHeaders: ['X-Total-Count']
  }));
  app.use(express.json());
  app.use(logger);

  app.use('/api', routes);

  if (process.env.NODE_ENV === 'dev') {
    const testRouter = express.Router();
    
    testRouter.delete('/notes', async (req, res) => {
      const mongoose = require('mongoose');
      await mongoose.connection.collection('notes').deleteMany({});
      res.status(204).send();
    });
    
    app.use('/test', testRouter);
  }

  app.use(errorHandler);

  return app;
};

export default createApp; 