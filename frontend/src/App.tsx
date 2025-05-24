import { useEffect } from 'react';
import './App.css';
import NotesList from './components/NotesList';
import AddNoteForm from './components/AddNoteForm';
import Notification from './components/Notification';
import Pagination from './components/Pagination';
import { useNotesContext } from './contexts/NotesContext';
import * as notesApi from './api/notesApi';

function App() {
  const { state, dispatch } = useNotesContext();
  const { 
    notes, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    notification,
    editingNoteId,
    editedContent,
    isAddingNote,
    newNoteContent
  } = state;

  useEffect(() => {
    loadNotes(currentPage);
  }, [currentPage]);

  const loadNotes = async (page = 1) => {
    dispatch({ type: 'FETCH_NOTES_REQUEST' });
    
    try {
      const response = await notesApi.fetchNotes(page);
      const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
      const calculatedTotalPages = Math.ceil(totalCount / notesApi.POSTS_PER_PAGE);
      
      dispatch({
        type: 'FETCH_NOTES_SUCCESS',
        payload: {
          notes: response.data,
          totalPages: calculatedTotalPages
        }
      });
    } catch (err) {
      dispatch({
        type: 'FETCH_NOTES_FAILURE',
        payload: 'Failed to fetch notes'
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  const startEditingNote = (note: any) => {
    dispatch({ 
      type: 'START_EDITING_NOTE', 
      payload: { id: note._id, content: note.content } 
    });
  };

  const cancelEditingNote = () => {
    dispatch({ type: 'CANCEL_EDITING_NOTE' });
  };

  const saveEditedNote = async (id: string) => {
    try {
      const response = await notesApi.updateNote(id, { content: editedContent });
      dispatch({ type: 'UPDATE_NOTE_SUCCESS', payload: response.data });
    } catch (err) {
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to update note' 
      });
    }
  };

  const setEditedContent = (content: string) => {
    dispatch({ type: 'SET_EDITED_CONTENT', payload: content });
  };

  const deleteNoteById = async (id: string) => {
    try {
      await notesApi.deleteNote(id);
      dispatch({ type: 'DELETE_NOTE_SUCCESS', payload: id });
    } catch (err) {
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to delete note' 
      });
    }
  };

  const startAddingNote = () => {
    dispatch({ type: 'START_ADDING_NOTE' });
  };

  const cancelAddingNote = () => {
    dispatch({ type: 'CANCEL_ADDING_NOTE' });
  };

  const saveNewNote = async () => {
    try {
      const response = await notesApi.createNote({ 
        title: 'New Note', 
        content: newNoteContent,
        author: { name: 'User', email: 'user@example.com' }
      });
      dispatch({ type: 'ADD_NOTE_SUCCESS', payload: response.data });
    } catch (err) {
      dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: 'Failed to add note' 
      });
    }
  };

  const setNewNoteContent = (content: string) => {
    dispatch({ type: 'SET_NEW_NOTE_CONTENT', payload: content });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>My Notes App</h1>
      </header>

      <main className="app-content">
        <Notification message={notification} />
        
        {error && <div className="error-message">{error}</div>}
        
        <AddNoteForm 
          isAdding={isAddingNote}
          content={newNoteContent}
          onContentChange={setNewNoteContent}
          onSave={saveNewNote}
          onCancel={isAddingNote ? cancelAddingNote : startAddingNote}
        />
        
        <NotesList 
          notes={notes}
          loading={loading}
          editingNoteId={editingNoteId}
          editedContent={editedContent}
          startEditingNote={startEditingNote}
          cancelEditingNote={cancelEditingNote}
          saveEditedNote={saveEditedNote}
          setEditedContent={setEditedContent}
          deleteNoteById={deleteNoteById}
        />
        
        {!loading && notes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;