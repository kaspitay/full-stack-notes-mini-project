import React, { createContext, useReducer, useContext } from 'react';
import { Note } from '../types';

export type NotesState = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  notification: string;
  editingNoteId: string | null;
  editedContent: string;
  isAddingNote: boolean;
  newNoteContent: string;
  cachedPages: Map<number, { notes: Note[]; totalPages: number; timestamp: number }>;
  currentVisiblePages: number[];
}

export type NotesAction = 
  | { type: 'FETCH_NOTES_REQUEST' }
  | { type: 'FETCH_NOTES_SUCCESS'; payload: { notes: Note[]; totalPages: number } }
  | { type: 'FETCH_NOTES_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'ADD_NOTE_SUCCESS'; payload: Note }
  | { type: 'UPDATE_NOTE_SUCCESS'; payload: Note }
  | { type: 'DELETE_NOTE_SUCCESS'; payload: string }
  | { type: 'SET_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'START_EDITING_NOTE'; payload: { id: string; content: string } }
  | { type: 'CANCEL_EDITING_NOTE' }
  | { type: 'SET_EDITED_CONTENT'; payload: string }
  | { type: 'START_ADDING_NOTE' }
  | { type: 'CANCEL_ADDING_NOTE' }
  | { type: 'SET_NEW_NOTE_CONTENT'; payload: string }
  | { type: 'CACHE_PAGE'; payload: { page: number; notes: Note[]; totalPages: number } }
  | { type: 'LOAD_FROM_CACHE'; payload: { page: number } }
  | { type: 'SET_VISIBLE_PAGES'; payload: number[] }
  | { type: 'CLEAR_CACHE' }
  | { type: 'INVALIDATE_CACHE_PAGES'; payload: number[] };

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  notification: 'Notification area',
  editingNoteId: null,
  editedContent: '',
  isAddingNote: false,
  newNoteContent: '',
  cachedPages: new Map(),
  currentVisiblePages: [1, 2, 3, 4, 5]
};

const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
  switch (action.type) {
    case 'FETCH_NOTES_REQUEST':
      return {...state, loading: true, error: null};
    case 'FETCH_NOTES_SUCCESS':
      return {...state, loading: false, notes: action.payload.notes, totalPages: action.payload.totalPages};
    case 'FETCH_NOTES_FAILURE':
      return {...state, loading: false, error: action.payload, notes: []};
    case 'SET_CURRENT_PAGE':
      return {...state, currentPage: action.payload};
    case 'ADD_NOTE_SUCCESS':
      return {
        ...state, 
        notification: 'Added a new note', 
        notes: [action.payload, ...state.notes],
        currentPage: 1,
        cachedPages: new Map(),
        isAddingNote: false,
        newNoteContent: ''
      };
    case 'UPDATE_NOTE_SUCCESS': {
      // Only invalidate current page cache, keep others
      const updatedCacheForUpdate = new Map(state.cachedPages);
      updatedCacheForUpdate.delete(state.currentPage);
      
      return {
        ...state, 
        notification: 'Note updated', 
        notes: state.notes.map(note => note._id === action.payload._id ? action.payload : note),
        cachedPages: updatedCacheForUpdate,
        editingNoteId: null,
        editedContent: ''
      };
    }
    case 'DELETE_NOTE_SUCCESS': {
      // Only clear current page cache (deletion affects current page)
      const updatedCacheForDelete = new Map(state.cachedPages);
      updatedCacheForDelete.delete(state.currentPage);
      
      return {
        ...state, 
        notification: 'Note deleted', 
        notes: state.notes.filter(note => note._id !== action.payload),
        cachedPages: updatedCacheForDelete
      };
    }
    case 'SET_NOTIFICATION':
      return {...state, notification: action.payload};
    case 'CLEAR_NOTIFICATION':
      return {...state, notification: 'Notification area'};
    case 'START_EDITING_NOTE':
      return {...state, editingNoteId: action.payload.id, editedContent: action.payload.content};
    case 'CANCEL_EDITING_NOTE':
      return {...state, editingNoteId: null, editedContent: ''};
    case 'SET_EDITED_CONTENT':
      return {...state, editedContent: action.payload};
    case 'START_ADDING_NOTE':
      return {...state, isAddingNote: true};
    case 'CANCEL_ADDING_NOTE':
      return {...state, isAddingNote: false, newNoteContent: ''};
    case 'SET_NEW_NOTE_CONTENT':
      return {...state, newNoteContent: action.payload};
    case 'CACHE_PAGE':
      const newCache = new Map(state.cachedPages);
      newCache.set(action.payload.page, {
        notes: action.payload.notes,
        totalPages: action.payload.totalPages,
        timestamp: Date.now()
      });
      return {...state, cachedPages: newCache};
    case 'LOAD_FROM_CACHE': {
      const cachedData = state.cachedPages.get(action.payload.page);
      if (cachedData) {
        return {
          ...state,
          notes: cachedData.notes,
          totalPages: cachedData.totalPages,
          currentPage: action.payload.page
        };
      }
      return state;
    }
    case 'SET_VISIBLE_PAGES':
      return {...state, currentVisiblePages: action.payload};
    case 'CLEAR_CACHE':
      return {...state, cachedPages: new Map()};
    case 'INVALIDATE_CACHE_PAGES': {
      const newCache = new Map(state.cachedPages);
      action.payload.forEach(page => newCache.delete(page));
      return {...state, cachedPages: newCache};
    }
    default:
      return state;
  }
};

// Context
const NotesContext = createContext<{
  state: NotesState;
  dispatch: React.Dispatch<NotesAction>;
} | undefined>(undefined);

// Provider component
export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook to use the context
export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotesContext must be used within NotesProvider');
  return context;
};