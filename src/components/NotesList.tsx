import { Note } from '../types';

interface NotesListProps {
  notes: Note[];
  loading: boolean;
}

const NotesList = ({ notes, loading }: NotesListProps) => {
  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return <div className="no-notes">No notes found</div>;
  }

  return (
    <div className="notes-list">
      {notes.map(note => (
        <div key={note.id} className="note" id={note.id.toString()}>
          <h2>{note.title}</h2>
          <small>{note.author.name}</small>
          <div className="note-content">{note.content}</div>
        </div>
      ))}
    </div>
  );
};

export default NotesList; 