import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

// Login user
router.post('/', userController.loginUser);

export default router;
