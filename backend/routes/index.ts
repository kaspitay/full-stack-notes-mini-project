import { Router } from 'express';
import noteRoutes from './noteRoutes';
import userRoutes from './userRoutes';
import loginRoutes from './loginRoutes';

const router = Router();

router.use('/notes', noteRoutes);
router.use('/users', userRoutes);
router.use('/login', loginRoutes);


router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

export default router; 