import React from "react";
import { Button } from "./index";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 1; // Показывать первые 3 и последние 3

    if (totalPages <= showPages * 2 + 1) {
      // Если страниц мало, показать все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Показать первые 3
      for (let i = 1; i <= showPages; i++) {
        pages.push(i);
      }

      // Добавить троеточие, если нужно
      if (currentPage > showPages + 1) {
        pages.push("...");
      }

      // Показать текущую страницу и соседние, если не в начале или конце
      const start = Math.max(showPages + 1, currentPage - 1);
      const end = Math.min(totalPages - showPages, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      // Добавить троеточие перед последними
      if (currentPage < totalPages - showPages) {
        pages.push("...");
      }

      // Показать последние 3
      for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {"<"}
      </Button>

      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="pagination-ellipsis">...</span>
          ) : (
            <Button
              variant={page === currentPage ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {">"}
      </Button>
    </div>
  );
};

export default Pagination;
