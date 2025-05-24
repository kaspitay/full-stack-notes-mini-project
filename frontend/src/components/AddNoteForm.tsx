
interface AddNoteFormProps {
  isAdding: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AddNoteForm = ({
  isAdding,
  content,
  onContentChange,
  onSave,
  onCancel
}: AddNoteFormProps): JSX.Element => {
  if (!isAdding) {
    return (
      <div className="add-note-container">
        <button 
          name="add_new_note"
          onClick={onCancel} // This will start adding in the parent component
          className="add-note-button"
        >
          Add New Note
        </button>
      </div>
    );
  }

  return (
    <div className="add-note-form">
      <input
        type="text"
        name="text_input_new_note"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Enter your note here..."
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