import { useEffect, useState, useCallback } from 'react';
import { useNotesContext } from '../contexts/NotesContext';
import * as notesApi from '../api/notesApi';
import { Note } from '../types';

const useNotes = () => {
  const { state, dispatch } = useNotesContext();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Load notes based on the current page
  const loadNotes = useCallback((page: number = 1) => {
    dispatch({ type: 'FETCH_NOTES_REQUEST' });
    
    notesApi.fetchNotes(page)
      .then(response => {
        const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
        const calculatedTotalPages = Math.ceil(totalCount / notesApi.POSTS_PER_PAGE);

        dispatch({ 
          type: 'FETCH_NOTES_SUCCESS', 
          payload: { 
            notes: response.data, 
            totalPages: calculatedTotalPages 
          } 
        });
        dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
      })
      .catch(err => {
        dispatch({ 
          type: 'FETCH_NOTES_FAILURE', 
          payload: 'Failed to fetch notes. Please try again later.' 
        });
        console.error('Error fetching notes:', err);
      });
  }, [dispatch]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > state.totalPages) return;
    loadNotes(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start editing a note
  const startEditingNote = (note: Note) => {
    setEditingNoteId(note._id);
    setEditedContent(note.content);
  };

  // Cancel editing a note
  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditedContent('');
  };

  // Save edited note
  const saveEditedNote = async (id: string) => {
    try {
      const response = await notesApi.updateNote(id, { content: editedContent });
      dispatch({ type: 'UPDATE_NOTE_SUCCESS', payload: response.data });
      setEditingNoteId(null);
      setEditedContent('');
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 3000);
    } catch (error) {
      console.error('Error updating note:', error);
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to update note. Please try again.' 
      });
    }
  };

  // Delete a note
  const deleteNoteById = async (id: string) => {
    try {
      await notesApi.deleteNote(id);
      dispatch({ type: 'DELETE_NOTE_SUCCESS', payload: id });
      
      // If deleting the note empties the current page and it's not the first page,
      // we might want to go to the previous page
      if (state.notes.length === 1 && state.currentPage > 1) {
        loadNotes(state.currentPage - 1);
      } else if (state.notes.length === 1) {
        // If it's the first page and becomes empty, just reload the first page
        loadNotes(1);
      } else {
        // Otherwise, reload the current page to get new notes
        loadNotes(state.currentPage);
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 3000);
    } catch (error) {
      console.error('Error deleting note:', error);
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to delete note. Please try again.' 
      });
    }
  };

  // Start adding a new note
  const startAddingNote = () => {
    setIsAddingNote(true);
    setNewNoteContent('');
  };

  // Cancel adding a new note
  const cancelAddingNote = () => {
    setIsAddingNote(false);
    setNewNoteContent('');
  };

  // Save a new note
  const saveNewNote = async () => {
    if (!newNoteContent.trim()) {
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Note content cannot be empty' 
      });
      return;
    }

    try {
      const newNote = {
        title: `Note ${new Date().toLocaleDateString()}`,
        content: newNoteContent,
        author: {
          name: 'User',
          email: 'user@example.com'
        }
      };

      const response = await notesApi.createNote(newNote);
      dispatch({ type: 'ADD_NOTE_SUCCESS', payload: response.data });
      setIsAddingNote(false);
      setNewNoteContent('');
      
      // Reload the first page to show the new note
      loadNotes(1);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 3000);
    } catch (error) {
      console.error('Error creating note:', error);
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to create note. Please try again.' 
      });
    }
  };

  // Load notes on component mount and when current page changes
  useEffect(() => {
    loadNotes(state.currentPage);
  }, [loadNotes, state.currentPage]);

  return {
    ...state,
    onPageChange: handlePageChange,
    editingNoteId,
    editedContent,
    isAddingNote,
    newNoteContent,
    startEditingNote,
    cancelEditingNote,
    saveEditedNote,
    setEditedContent,
    deleteNoteById,
    startAddingNote,
    cancelAddingNote,
    saveNewNote,
    setNewNoteContent
  };
};

export default useNotes; 