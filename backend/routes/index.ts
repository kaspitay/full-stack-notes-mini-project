import { Router } from 'express';
import noteRoutes from './noteRoutes';

const router = Router();

router.use('/notes', noteRoutes);


router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

export default router; 