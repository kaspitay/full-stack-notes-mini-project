import { Router } from 'express';
import * as noteController from '../controllers/noteController';

const router = Router();

// Get all notes 
router.get('/', noteController.getAllNotes);

// Get note by ID
router.get('/:id', noteController.getNoteById);

// Create new note
router.post('/', noteController.createNote);

// Update note by ID
router.put('/:id', noteController.updateNoteById);

// Delete note by ID
router.delete('/:id', noteController.deleteNoteById);

// Get note by index
router.get('/by-index/:i', noteController.getNoteByIndex);

// Update note by index
router.put('/by-index/:i', noteController.updateNoteByIndex);

// Delete note by index
router.delete('/by-index/:i', noteController.deleteNoteByIndex);

export default router; 