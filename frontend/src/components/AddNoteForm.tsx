
import { useAuth } from '../contexts/AuthContext';

interface AddNoteFormProps {
  isAdding: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onStartAdding: () => void;
}

const AddNoteForm = ({
  isAdding,
  content,
  onContentChange,
  onSave,
  onCancel,
  onStartAdding
}: AddNoteFormProps): JSX.Element => {
  const { state: authState } = useAuth();

  if (!authState.user) {
    return <div></div>;
  }

  if (!isAdding) {
    return (
      <div className="add-note-container">
        <button 
          name="add_new_note"
          onClick={onStartAdding}
          className="add-note-button"
        >
          Add New Note
        </button>
      </div>
    );
  }

  return (
    <div className="add-note-form">
      <textarea
        name="text_input_new_note"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Enter your note here (HTML supported)..."
        rows={4}
      />
      <button 
        name="text_input_save_new_note"
        onClick={onSave}
      >
        Save
      </button>
      <button 
        name="text_input_cancel_new_note"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default AddNoteForm;