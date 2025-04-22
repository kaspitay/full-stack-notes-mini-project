import { useState, useEffect } from 'react';
import { Note } from '../types';
import { fetchNotes, POSTS_PER_PAGE } from '../api/notesApi';

const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadNotes = (page: number = 1) => {
    setLoading(true);
    
    fetchNotes(page)
      .then(response => {
        const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
        const calculatedTotalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

        setNotes(response.data);
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page);
        setError(null);
      })
      .catch(err => {
        setError('Failed to fetch notes. Please try again later.');
        console.error('Error fetching notes:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    loadNotes(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    currentPage,
    totalPages,
    onPageChange: handlePageChange
  };
};

export default useNotes;