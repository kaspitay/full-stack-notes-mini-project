import axios from 'axios';

const API_URL = 'http://localhost:3001';
export const POSTS_PER_PAGE = 10;

// Fetch notes for a specific page
export const fetchNotes = (activePage: number) => {
  return axios.get(`${API_URL}/notes`, {
    params: {
      _page: activePage,
      _limit: POSTS_PER_PAGE
    }
  });
};