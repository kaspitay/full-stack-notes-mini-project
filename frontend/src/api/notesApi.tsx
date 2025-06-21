import axios from 'axios';
import { Note } from '../types';

const API_URL = 'http://localhost:3001/api';
export const POSTS_PER_PAGE = 10;

// Configure axios with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers['Authorization'];
  }
};

// Fetch notes for a specific page
export const fetchNotes = (activePage: number) => {
  return api.get(`/notes`, {
    params: {
      _page: activePage,
      _per_page: POSTS_PER_PAGE
    }
  });
};

// Fetch a specific note by ID
export const fetchNoteById = (id: string) => {
  return api.get(`/notes/${id}`);
};

// Create a new note
export const createNote = (note: Partial<Note>) => {
  return api.post('/notes', note);
};

// Update a note
export const updateNote = (id: string, note: Partial<Note>) => {
  return api.put(`/notes/${id}`, note);
};

// Delete a note
export const deleteNote = (id: string) => {
  return api.delete(`/notes/${id}`);
}; 