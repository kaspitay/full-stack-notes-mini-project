import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSanitizer } from '../contexts/SanitizerContext';
import NotesList from './NotesList';
import AddNoteForm from './AddNoteForm';
import Notification from './Notification';
import Pagination from './Pagination';
import useNotes from '../hooks/useNotes';

const HomePage = () => {
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { isSanitizerEnabled, toggleSanitizer } = useSanitizer();
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
    newNoteContent,
    onPageChange,
    startEditingNote,
    cancelEditingNote,
    saveEditedNote,
    setEditedContent,
    deleteNoteById,
    startAddingNote,
    cancelAddingNote,
    saveNewNote,
    setNewNoteContent
  } = useNotes();

  const handleLogout = () => {
    authDispatch({ type: 'LOGOUT' });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>My Notes App</h1>
        
        {/* Sanitizer Toggle */}
        <div className="sanitizer-controls">
          <button 
            onClick={toggleSanitizer}
            className={`sanitizer-toggle ${isSanitizerEnabled ? 'enabled' : 'disabled'}`}
            data-testid="sanitizer-toggle"
          >
            Sanitizer: {isSanitizerEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {authState.user ? (
          <div className="user-info">
            <span>Welcome, {authState.user.name}!</span>
            <button 
              data-testid="logout"
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login">
              <button data-testid="go_to_login_button">
                Go to Login
              </button>
            </Link>
            <Link to="/create-user">
              <button data-testid="go_to_create_user_button">
                Create New User
              </button>
            </Link>
          </div>
        )}
      </header>

      <main className="app-content">
        <Notification message={notification} />
        
        {error && <div className="error-message">{error}</div>}
        
        <AddNoteForm 
          isAdding={isAddingNote}
          content={newNoteContent}
          onContentChange={setNewNoteContent}
          onSave={saveNewNote}
          onCancel={cancelAddingNote}
          onStartAdding={startAddingNote}
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
            onPageChange={onPageChange}
          />
        )}
      </main>
    </div>
  );
};

export default HomePage;
