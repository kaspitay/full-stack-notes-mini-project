import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor {
  name: string;
  email: string;
}

export interface INote extends Document {
  title: string;
  author: IAuthor | null;
  content: string;
  user?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>({
  name: { type: String, required: true },
  email: { type: String, required: true }
});

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    author: { type: AuthorSchema, required: false, default: null },
    content: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<INote>('Note', NoteSchema);