import { Request, Response } from 'express';
import * as noteService from '../services/noteService';

export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  const { notes, count } = await noteService.getAllNotes(req.query);
  
  // Set the total count in the header for pagination
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

export const createNote = async (req: Request, res: Response): Promise<void> => {
  const { title, author, content } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ message: 'Title and content are required' });
    return;
  }
  
  const newNote = await noteService.createNote({ title, author, content });
  res.status(201).json(newNote);
};

export const updateNoteById = async (req: Request, res: Response): Promise<void> => {
  const { title, author, content } = req.body;
  
  // Check if any update data was provided
  if (!title && !author && !content) {
    res.status(400).json({ message: 'No update data provided' });
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
  
  // Check if any update data was provided
  if (!title && !author && !content) {
    res.status(400).json({ message: 'No update data provided' });
    return;
  }
  
  const updatedNote = await noteService.updateNoteByIndex(index, { title, author, content });
  res.status(200).json(updatedNote);
};

export const deleteNoteById = async (req: Request, res: Response): Promise<void> => {
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