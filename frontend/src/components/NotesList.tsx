import { Note } from '../types';
import NoteItem from './NoteItem';

type NotesListProps = {
  notes: Note[];
  loading: boolean;
  editingNoteId: string | null;
  editedContent: string;
  startEditingNote: (note: Note) => void;
  cancelEditingNote: () => void;
  saveEditedNote: (id: string) => void;
  setEditedContent: (content: string) => void;
  deleteNoteById: (id: string) => void;
}

const NotesList = ({
  notes,
  loading,
  editingNoteId,
  editedContent,
  startEditingNote,
  cancelEditingNote,
  saveEditedNote,
  setEditedContent,
  deleteNoteById
}: NotesListProps) => {
  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return <div className="no-notes">No notes found</div>;
  }

  return (
    <div className="notes-list">
      {notes.map(note => (
        <NoteItem
          key={note._id}
          note={note}
          editingNoteId={editingNoteId}
          editedContent={editedContent}
          onEdit={startEditingNote}
          onDelete={deleteNoteById}
          onSave={saveEditedNote}
          onCancel={cancelEditingNote}
          onContentChange={setEditedContent}
        />
      ))}
    </div>
  );
};

export default NotesList;