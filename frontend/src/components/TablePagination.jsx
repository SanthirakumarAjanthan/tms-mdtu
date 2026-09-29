import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TablePagination({ total, page, perPage, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="pagination">
      <span>Showing {start}–{end} of {total} records</span>
      <div className="page-btns">
        <button className="page-btn" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft size={13} />
        </button>
        {pages.map(p => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
        ))}
        <button className="page-btn" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
