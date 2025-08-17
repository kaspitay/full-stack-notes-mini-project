type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps): JSX.Element | null => {
  if (totalPages <= 0) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    else {
      if (currentPage < 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      }
      else if (currentPage > totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
      else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      <button 
        name="first"
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
      >
        First
      </button>
      
      <button 
        name="previous"
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      {getPageNumbers().map(number => (
        <button
          key={number}
          name={`page-${number}`}
          onClick={() => onPageChange(number)}
          disabled={currentPage === number}
        >
          {number}
        </button>
      ))}
      
      <button 
        name="next"
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      
      <button 
        name="last"
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;