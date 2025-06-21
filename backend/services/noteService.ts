import Note, { INote } from '../models/note';
import { POSTS_PER_PAGE } from '../consts';
import { CustomError } from '../middlewares/errorHandler';
import { Types } from 'mongoose';

interface GetAllNotesParams {
  _page?: string;
  _per_page?: string;
  _limit?: string;
}

interface GetAllNotesResult {
  notes: INote[];
  count: number;
}

export const getAllNotes = async (params: GetAllNotesParams): Promise<GetAllNotesResult> => {
  try {
    const page = params._page ? parseInt(params._page as string, 10) : 1;
    const limit = params._per_page || params._limit 
      ? parseInt((params._per_page || params._limit) as string, 10) 
      : POSTS_PER_PAGE;
    
    const skip = (page - 1) * limit;
    const count = await Note.countDocuments();
    
    const notes = await Note.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    return { notes, count };
  } catch (error) {
    console.error('Error in getAllNotes:', error);
    throw error;
  }
};

export const getNoteById = async (id: string): Promise<INote> => {
  const note = await Note.findById(id);
  
  if (!note) {
    const error: CustomError = new Error(`Note with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  
  return note;
};

export const getNoteByIndex = async (index: number): Promise<INote> => {
  const skip = index;
  
  const notes = await Note.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(1);
  
  if (notes.length === 0) {
    const error: CustomError = new Error(`Note at index ${index} not found`);
    error.status = 404;
    throw error;
  }
  
  return notes[0];
};

export const createNote = async (noteData: Partial<INote>): Promise<INote> => {
  const note = new Note(noteData);
  await note.save();
  
  return note;
};

export const updateNoteById = async (id: string, noteData: Partial<INote>): Promise<INote> => {
  const note = await Note.findByIdAndUpdate(id, noteData, { new: true, runValidators: true });
  
  if (!note) {
    const error: CustomError = new Error(`Note with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  
  return note;
};

export const updateNoteByIndex = async (index: number, noteData: Partial<INote>): Promise<INote> => {
  // First get the note at the specified index
  const noteToUpdate = await getNoteByIndex(index);
  
  // Then update it - properly handle the _id by converting it to a string
  return updateNoteById(noteToUpdate._id instanceof Types.ObjectId 
    ? noteToUpdate._id.toString() 
    : String(noteToUpdate._id), noteData);
};

export const deleteNoteById = async (id: string): Promise<void> => {
  const note = await Note.findByIdAndDelete(id);
  
  if (!note) {
    const error: CustomError = new Error(`Note with id ${id} not found`);
    error.status = 404;
    throw error;
  }
};

export const deleteNoteByIndex = async (index: number): Promise<void> => {
  // First get the note at the specified index
  const noteToDelete = await getNoteByIndex(index);
  
  // Then delete it - properly handle the _id by converting it to a string
  await deleteNoteById(noteToDelete._id instanceof Types.ObjectId 
    ? noteToDelete._id.toString() 
    : String(noteToDelete._id));
}; 