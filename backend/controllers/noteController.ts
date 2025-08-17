import { Request, Response } from 'express';
import * as noteService from '../services/noteService';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  const { notes, count } = await noteService.getAllNotes(req.query);
  
  res.set('X-Total-Count', count.toString());
  res.status(200).json(notes);
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  const note = await noteService.getNoteById(req.params.id);
  res.status(200).json(note);
};

export const getNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = parseInt(req.params.i, 10);
  
  if (isNaN(index) || index < 0) {
    res.status(400).json({ message: 'Invalid index, must be a non-negative integer' });
    return;
  }
  
  const note = await noteService.getNoteByIndex(index);
  res.status(200).json(note);
};

export const createNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, author, content } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ message: 'Title and content are required' });
    return;
  }
  
  const noteData: any = { title, author, content };
  if (req.user) {
    noteData.user = req.user.id;
  }
  
  const newNote = await noteService.createNote(noteData);
  res.status(201).json(newNote);
};

export const updateNoteById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, author, content } = req.body;
  
  if (!title && !author && !content) {
    res.status(400).json({ message: 'No update data provided' });
    return;
  }
  
  const note = await noteService.getNoteById(req.params.id);
  if (note.user && req.user && note.user.toString() !== req.user.id) {
    res.status(403).json({ message: 'Unauthorized to edit this note' });
    return;
  }
  
  const updatedNote = await noteService.updateNoteById(req.params.id, { title, author, content });
  res.status(200).json(updatedNote);
};

export const updateNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const { title, author, content } = req.body;
  const index = parseInt(req.params.i, 10);
  
  if (isNaN(index) || index < 0) {
    res.status(400).json({ message: 'Invalid index, must be a non-negative integer' });
    return;
  }
  
  if (!title && !author && !content) {
    res.status(400).json({ message: 'No update data provided' });
    return;
  }
  
  const updatedNote = await noteService.updateNoteByIndex(index, { title, author, content });
  res.status(200).json(updatedNote);
};

export const deleteNoteById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const note = await noteService.getNoteById(req.params.id);
  if (note.user && req.user && note.user.toString() !== req.user.id) {
    res.status(403).json({ message: 'Unauthorized to delete this note' });
    return;
  }
  
  await noteService.deleteNoteById(req.params.id);
  res.status(204).send();
};

export const deleteNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = parseInt(req.params.i, 10);
  
  if (isNaN(index) || index < 0) {
    res.status(400).json({ message: 'Invalid index, must be a non-negative integer' });
    return;
  }
  
  await noteService.deleteNoteByIndex(index);
  res.status(204).send();
};