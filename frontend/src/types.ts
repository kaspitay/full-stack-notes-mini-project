export type Author = {
  name: string;
  email: string;
};

export type Note = {
  _id: string;
  title: string;
  author?: Author;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface NotesResponse {
  notes: Note[];
  totalCount?: number;
}