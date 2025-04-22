
import './App.css'
import NotesList from './components/NotesList'
import Pagination from './components/Pagination'
import useNotes from './hooks/useNotes'

function App() {

  const {
    notes,
    loading,
    error,
    currentPage,
    totalPages,
    onPageChange
  } = useNotes();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>My Notes App</h1>
      </header>

      <main className="app-content">
        {error && <div className="error-message">{error}</div>}
        
        <NotesList notes={notes} loading={loading} />
        
        {!loading && !error && notes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;