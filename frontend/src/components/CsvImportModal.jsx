import { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import Modal from './Modal';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * CSV Import Modal — drag-and-drop, preview, import.
 *
 * Props:
 *   open          boolean
 *   onClose       ()=>void
 *   title         string
 *   importUrl     string  — POST endpoint
 *   templateHeaders string[] — column headers for the blank template download
 *   templateFilename string  — filename for the template (without .csv)
 *   onSuccess     ()=>void — called after successful import
 */
export default function CsvImportModal({ open, onClose, title, importUrl, templateHeaders = [], templateFilename = 'template', onSuccess }) {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState([]);   // [{header: val, ...}]
  const [result, setResult]   = useState(null); // { inserted, updated, errors[] }
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  if (!open) return null;

  // ── Parse preview ──────────────────────────────────────────
  const parseCsvText = (text) => {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    return lines.slice(1, 6).map(line => {
      const vals = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
    });
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.csv$/i)) { toast.error('Please select a .csv file'); return; }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(parseCsvText(e.target.result));
    reader.readAsText(f, 'UTF-8');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) { toast.error('No file selected'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post(importUrl, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      toast.success(`Import complete: ${data.inserted} added, ${data.updated} updated`);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const bom = '\uFEFF';
    const header = templateHeaders.map(h => `"${h}"`).join(',');
    const blob = new Blob([bom + header + '\r\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${templateFilename}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setFile(null); setPreview([]); setResult(null); };
  const close = () => { reset(); onClose(); };

  const previewHeaders = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <Modal
      title={`Import CSV — ${title}`}
      onClose={close}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <button className="btn btn-ghost btn-sm gap-1.5" onClick={downloadTemplate}>
            <Download size={13} /> Download Template
          </button>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={close}>Cancel</button>
            <button
              className="btn btn-primary btn-sm gap-1.5"
              onClick={handleImport}
              disabled={!file || loading || !!result}
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {loading ? 'Importing…' : 'Import'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Drop zone */}
        {!result && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-primary bg-primary-dim' : 'border-border hover:border-primary/50 hover:bg-surface-2'
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={28} className="text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-slate-800 text-sm">{file.name}</div>
                  <div className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB · {preview.length} data rows previewed</div>
                </div>
                <button className="ml-2 text-slate-400 hover:text-danger" onClick={e => { e.stopPropagation(); reset(); }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Drag & drop a CSV file here</p>
                <p className="text-xs text-muted mt-1">or click to browse · max 5 MB</p>
              </>
            )}
          </div>
        )}

        {/* Preview table */}
        {preview.length > 0 && !result && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview (first {preview.length} rows)</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="tbl text-xs">
                <thead>
                  <tr>{previewHeaders.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>{previewHeaders.map(h => <td key={h} className="max-w-[160px] truncate">{row[h]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-success-dim border border-success/20">
                <CheckCircle2 size={22} className="text-success" />
                <div>
                  <div className="text-xl font-black text-success">{result.inserted}</div>
                  <div className="text-xs text-emerald-700 font-medium">Records Added</div>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-primary-dim border border-primary/20">
                <CheckCircle2 size={22} className="text-primary" />
                <div>
                  <div className="text-xl font-black text-primary">{result.updated}</div>
                  <div className="text-xs text-blue-700 font-medium">Records Updated</div>
                </div>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="p-3 rounded-lg bg-danger-dim border border-danger/20">
                <div className="flex items-center gap-2 text-danger text-xs font-semibold mb-2">
                  <AlertTriangle size={14} /> {result.errors.length} error(s)
                </div>
                <ul className="text-xs text-danger space-y-1 max-h-24 overflow-y-auto">
                  {result.errors.map((e, i) => <li key={i}>· {e}</li>)}
                </ul>
              </div>
            )}
            <button className="btn btn-secondary btn-sm w-full" onClick={reset}>Import Another File</button>
          </div>
        )}

        {/* Instructions */}
        {!file && !result && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary-dim border border-primary/20 text-xs text-blue-700">
            <FileText size={14} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">Tip:</span> Download the template CSV first to see the correct column format.
              Existing records will be updated (matched by NIC / Name / Qualification).
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
