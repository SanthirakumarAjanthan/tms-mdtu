import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Upload, FileDown, Database } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Professional DataTable with search, sort, pagination, CSV/Excel import/export.
 *
 * Props:
 *  columns: [{ key, label, render?, sortable?, className? }]
 *  data: array of objects
 *  loading: boolean
 *  onExport?: function     — Excel export button
 *  onExportCsv?: function  — CSV export button
 *  onImportCsv?: function  — CSV import button
 *  actions?: ReactNode     — extra header actions
 */
export default function DataTable({ columns, data = [], loading = false, onExport, onExportCsv, onImportCsv, actions }) {
  const [query, setQuery]       = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage]         = useState(1);
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState('asc');

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(row => columns.some(col => {
      const val = row[col.key];
      return val && String(val).toLowerCase().includes(q);
    }));
  }, [data, query, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv), undefined, { numeric: true })
        : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronUp size={11} className="text-slate-300 ml-1 flex-shrink-0" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-blue-500 ml-1 flex-shrink-0" />
      : <ChevronDown size={11} className="text-blue-500 ml-1 flex-shrink-0" />;
  };

  // Smart page number display
  const pageNums = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }, [page, totalPages]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up">

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        {/* Left: show N entries */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Show</span>
          <select
            className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 shadow-sm"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>entries</span>
        </div>

        {/* Right: action buttons + search */}
        <div className="flex items-center gap-2 flex-wrap">
          {actions}

          {onImportCsv && (
            <button
              onClick={onImportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm transition-all"
            >
              <Upload size={12} /> Import CSV
            </button>
          )}

          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 shadow-sm transition-all"
            >
              <FileDown size={12} /> Export CSV
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 shadow-sm transition-all"
            >
              <Download size={12} /> Export Excel
            </button>
          )}

          {/* Search box */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white shadow-sm focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <Search size={12} className="text-slate-400 flex-shrink-0" />
            <input
              className="text-xs outline-none bg-transparent w-40 placeholder:text-slate-400 text-slate-700"
              placeholder="Search records…"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setPage(1); }} className="text-slate-300 hover:text-slate-500 text-[10px] font-bold">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left w-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">#</th>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none hover:text-blue-600 hover:bg-blue-50/50 transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-14">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-sm">Loading records…</span>
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Database size={36} strokeWidth={1.2} className="text-slate-300" />
                    <div>
                      <p className="font-semibold text-slate-500 text-sm">No records found</p>
                      {query && <p className="text-xs mt-0.5">Try adjusting your search term</p>}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={row.id ?? i} className="hover:bg-blue-50/30 transition-colors duration-100">
                  <td className="px-4 py-3 text-slate-400 text-xs font-medium">{(page - 1) * pageSize + i + 1}</td>
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 align-middle ${col.className || ''}`}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? <span className="text-slate-300">—</span>)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2 bg-slate-50/40">
        <span className="text-slate-400">
          {sorted.length === 0
            ? 'No entries'
            : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length} entries`}
          {query && ` · filtered from ${data.length} total`}
        </span>

        <div className="flex gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          >
            <ChevronLeft size={13} />
          </button>

          {pageNums.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs">…</span>
            ) : (
              <button
                key={p}
                className={`w-7 h-7 flex items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
