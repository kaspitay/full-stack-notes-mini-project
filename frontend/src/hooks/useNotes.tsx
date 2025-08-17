import { useEffect, useState, useCallback } from 'react';
import { useNotesContext } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import * as notesApi from '../api/notesApi';
import { Note } from '../types';

const useNotes = () => {
  const { state, dispatch } = useNotesContext();
  const { state: authState } = useAuth();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    notesApi.setAuthToken(authState.token);
  }, [authState.token]);

  const getVisiblePages = (currentPage: number, totalPages: number): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const preloadPages = useCallback(async (pages: number[]) => {
    // Only preload pages that aren't already cached
    const uncachedPages = pages.filter(page => !state.cachedPages.has(page));
    
    if (uncachedPages.length === 0) return;
    
    try {
      // Preload in parallel but don't block UI
      const preloadPromises = uncachedPages.map(async (page) => {
        try {
          const response = await notesApi.fetchNotes(page);
          const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
          const calculatedTotalPages = Math.ceil(totalCount / notesApi.POSTS_PER_PAGE);

          dispatch({ 
            type: 'CACHE_PAGE', 
            payload: { 
              page, 
              notes: response.data, 
              totalPages: calculatedTotalPages 
            } 
          });
        } catch (error) {
          console.log(`Failed to preload page ${page}:`, error);
        }
      });
      
      await Promise.all(preloadPromises);
    } catch (error) {
      console.error('Error preloading pages:', error);
    }
  }, [state.cachedPages, dispatch]);

  // Load notes with caching support
  const loadNotes = useCallback(async (page: number = 1, useCache: boolean = true) => {
    // Check cache first with timestamp validation
    if (useCache) {
      const cachedData = state.cachedPages.get(page);
      const isCacheValid = cachedData && (Date.now() - cachedData.timestamp < 300000); // 5 minutes
      
      if (isCacheValid) {
        dispatch({ type: 'LOAD_FROM_CACHE', payload: { page } });
        
        // Update visible pages for pagination
        const visiblePages = getVisiblePages(page, cachedData.totalPages);
        dispatch({ type: 'SET_VISIBLE_PAGES', payload: visiblePages });
        
        // Preload missing visible pages in background
        const pagesToPreload = visiblePages.filter(p => {
          const pCachedData = state.cachedPages.get(p);
          return p !== page && (!pCachedData || Date.now() - pCachedData.timestamp >= 300000);
        });
        if (pagesToPreload.length > 0) {
          preloadPages(pagesToPreload);
        }
        return;
      }
    }

    dispatch({ type: 'FETCH_NOTES_REQUEST' });
    
    try {
      const response = await notesApi.fetchNotes(page);
      const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
      const calculatedTotalPages = Math.ceil(totalCount / notesApi.POSTS_PER_PAGE);

      // Cache the page
      dispatch({ 
        type: 'CACHE_PAGE', 
        payload: { 
          page, 
          notes: response.data, 
          totalPages: calculatedTotalPages 
        } 
      });

      // Update current state
      dispatch({ 
        type: 'FETCH_NOTES_SUCCESS', 
        payload: { 
          notes: response.data, 
          totalPages: calculatedTotalPages 
        } 
      });
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });

      // Update visible pages and preload if needed
      const visiblePages = getVisiblePages(page, calculatedTotalPages);
      dispatch({ type: 'SET_VISIBLE_PAGES', payload: visiblePages });
      
      // Preload missing visible pages in background
      const pagesToPreload = visiblePages.filter(p => {
        const pCachedData = state.cachedPages.get(p);
        return p !== page && (!pCachedData || Date.now() - pCachedData.timestamp >= 300000);
      });
      if (pagesToPreload.length > 0) {
        preloadPages(pagesToPreload);
      }
    } catch (err) {
      dispatch({ 
        type: 'FETCH_NOTES_FAILURE', 
        payload: 'Failed to fetch notes. Please try again later.' 
      });
      console.error('Error fetching notes:', err);
    }
  }, [dispatch, state.cachedPages]);

  // Handle page change with cache-first approach
  const handlePageChange = (page: number) => {
    if (page < 1 || page > state.totalPages) return;
    
    // ALWAYS check cache first with timestamp validation (5 min expiry)
    const cachedData = state.cachedPages.get(page);
    const isCacheValid = cachedData && (Date.now() - cachedData.timestamp < 300000); // 5 minutes
    
    if (isCacheValid) {
      // Load from cache immediately - no network request
      dispatch({ type: 'LOAD_FROM_CACHE', payload: { page } });
      
      // Update visible pages for pagination bar
      const newVisiblePages = getVisiblePages(page, cachedData.totalPages);
      dispatch({ type: 'SET_VISIBLE_PAGES', payload: newVisiblePages });
      
      // Preload missing pages in background (non-blocking)
      const pagesToPreload = newVisiblePages.filter(p => {
        const pCachedData = state.cachedPages.get(p);
        return p !== page && (!pCachedData || Date.now() - pCachedData.timestamp >= 300000);
      });
      
      if (pagesToPreload.length > 0) {
        // Background preload without blocking UI
        preloadPages(pagesToPreload);
      }
    } else {
      // Cache miss or expired - fetch from server
      loadNotes(page, false);
    }
    
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
    if (!authState.token) {
      dispatch({ type: 'SET_NOTIFICATION', payload: 'You must be logged in to edit notes' });
      return;
    }

    try {
      const response = await notesApi.updateNote(id, { content: editedContent });
      dispatch({ type: 'UPDATE_NOTE_SUCCESS', payload: response.data });
      
      setEditingNoteId(null);
      setEditedContent('');
      
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
    if (!authState.token) {
      dispatch({ type: 'SET_NOTIFICATION', payload: 'You must be logged in to delete notes' });
      return;
    }

    try {
      await notesApi.deleteNote(id);
      dispatch({ type: 'DELETE_NOTE_SUCCESS', payload: id });
      
      // Reload current page to refresh content (cache is partially cleared in reducer)
      loadNotes(state.currentPage, false);
      
      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete note. Please try again.';
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: errorMessage
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
    if (!authState.token || !authState.user) {
      dispatch({ type: 'SET_NOTIFICATION', payload: 'You must be logged in to create notes' });
      return;
    }

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
          name: authState.user.name,
          email: authState.user.email
        }
      };

      const response = await notesApi.createNote(newNote);
      dispatch({ type: 'ADD_NOTE_SUCCESS', payload: response.data });
      setIsAddingNote(false);
      setNewNoteContent('');
      
      // Load page 1 to show the new note (cache is cleared in reducer)
      loadNotes(1, false);
      
      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 3000);
    } catch (error: any) {
      console.error('Error creating note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create note. Please try again.';
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: errorMessage
      });
    }
  };

  // Load notes on initial mount only if no notes and no cache
  useEffect(() => {
    if (state.notes.length === 0 && state.cachedPages.size === 0 && !state.loading) {
      loadNotes(1, false);
    }
  }, []);

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