import { Router } from 'express';
import * as noteController from '../controllers/noteController';
import { authenticateToken, optionalAuth } from '../middlewares/auth';

const router = Router();

router.get('/', optionalAuth, noteController.getAllNotes);
router.get('/:id', noteController.getNoteById);
router.post('/', authenticateToken, noteController.createNote);
router.put('/:id', authenticateToken, noteController.updateNoteById);
router.delete('/:id', authenticateToken, noteController.deleteNoteById);

router.get('/by-index/:i', noteController.getNoteByIndex);
router.put('/by-index/:i', noteController.updateNoteByIndex);
router.delete('/by-index/:i', noteController.deleteNoteByIndex);

export default router; 