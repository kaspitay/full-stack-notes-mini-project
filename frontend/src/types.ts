export type Author = {
  name: string;
  email: string;
};

export type Note = {
  _id: string;
  title: string;
  author?: Author;
  content: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface NotesResponse {
  notes: Note[];
  totalCount?: number;
}

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};