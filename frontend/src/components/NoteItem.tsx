
import { Note } from '../types';

interface NoteItemProps {
  note: Note;
  editingNoteId: string | null;
  editedContent: string;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onContentChange: (content: string) => void;
}

const NoteItem = ({
  note,
  editingNoteId,
  editedContent,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onContentChange
}: NoteItemProps): JSX.Element => {
  const isEditing = editingNoteId === note._id;

  return (
    <div className="note" data-testid={note._id}>
      <h2>{note.title}</h2>
      <small>By {note.author?.name}</small>
      <br />
      
      {isEditing ? (
        <>
          <textarea
            data-testid={`text_input-${note._id}`}
            value={editedContent}
            onChange={(e) => onContentChange(e.target.value)}
          />
          <button 
            data-testid={`text_input_save-${note._id}`}
            onClick={() => onSave(note._id)}
          >
            Save
          </button>
          <button 
            data-testid={`text_input_cancel-${note._id}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {note.content}
          <div className="note-actions">
            <button 
              data-testid={`edit-${note._id}`}
              onClick={() => onEdit(note)}
            >
              Edit
            </button>
            <button 
              data-testid={`delete-${note._id}`}
              onClick={() => onDelete(note._id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NoteItem;