export interface Author {
  name: string;
  email: string;
}

export interface Note {
  id: string | number;
  title: string;
  author: Author;
  content: string;
}

export interface NotesResponse {
  notes: Note[];
  totalCount?: number;
} 