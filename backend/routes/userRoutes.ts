import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

// Create new user
router.post('/', userController.createUser);

export default router;
