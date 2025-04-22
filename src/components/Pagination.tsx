interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 0) return null;

  const getPageNumbers = (): number[] => {
    const pageNumbers: number[] = [];
    
    if (totalPages <= 5) {  // If 5 or fewer pages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    else {  // If more than 5 pages
      if (currentPage < 3) { // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      }
      else if (currentPage > totalPages - 2) { // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
      else { // Show current page and 2 on each side
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      <p className="page-info">Showing Page {currentPage} of {totalPages}</p>
      
      <div className="pagination">
        <button 
          name="first"
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className="page-nav"
        >
          First
        </button>
        
        <button 
          name="previous"
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="page-nav"
        >
          Previous
        </button>
        
        <div className="page-numbers">
          {getPageNumbers().map(number => (
            <button
              key={number}
              name={`page-${number}`}
              onClick={() => onPageChange(number)}
              className={currentPage === number ? 'active' : ''}
              disabled={currentPage === number}
            >
              {number}
            </button>
          ))}
        </div>
        
        <button 
          name="next"
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="page-nav"
        >
          Next
        </button>
        
        <button 
          name="last"
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          className="page-nav"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;
