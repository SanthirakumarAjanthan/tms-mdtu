import { useState } from 'react';
import { COURSES } from '../../data/mockData';
import { Search, Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import Modal from '../../components/Modal';
import TablePagination from '../../components/TablePagination';

const EMPTY = { courseName: '', category: '', targetGroup: '', durationDays: 1 };
const PER_PAGE = 5;

export default function Courses() {
  const [data, setData]   = useState(COURSES);
  const [query, setQuery] = useState('');
  const [page, setPage]   = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(EMPTY);

  const filtered = data.filter(r =>
    [r.courseName, r.category, r.targetGroup].some(v =>
      v.toLowerCase().includes(query.toLowerCase())
    )
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd  = ()    => { setForm(EMPTY); setModal('add'); };
  const openEdit = row   => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close    = ()    => setModal(null);

  const save = () => {
    if (modal === 'add') setData(d => [...d, { ...form, id: Date.now(), durationDays: Number(form.durationDays) }]);
    else setData(d => d.map(r => r.id === modal.id ? { ...form, id: modal.id, durationDays: Number(form.durationDays) } : r));
    close();
  };

  const del = id => { if (window.confirm('Delete this course?')) setData(d => d.filter(r => r.id !== id)); };

  const catColors = { 'Planning & Management': 'badge-blue', Finance: 'badge-green', 'Soft Skills': 'badge-yellow', Procurement: 'badge-gray', IT: 'badge-blue', Administration: 'badge-gray' };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p className="subtitle">Manage training course catalogue</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Course</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><BookOpen size={22} /></div>
          <div className="stat-info"><div className="stat-value">{data.length}</div><div className="stat-label">Total Courses</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🗂️</div>
          <div className="stat-info"><div className="stat-value">{[...new Set(data.map(d => d.category))].length}</div><div className="stat-label">Categories</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div className="stat-info">
            <div className="stat-value">{Math.round(data.reduce((a,b) => a + b.durationDays, 0) / data.length)}</div>
            <div className="stat-label">Avg. Duration (days)</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Course Catalogue</div>
            <div className="card-subtitle">{filtered.length} courses</div>
          </div>
          <div className="search-bar">
            <Search size={14} color="var(--clr-text-muted)" />
            <input placeholder="Search courses…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card-body-flush tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Course Name</th>
                <th>Category</th>
                <th>Target Group</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><span className="es-icon">📚</span><span className="es-title">No courses found</span></div></td></tr>
              ) : paged.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-muted">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="fw-600">{r.courseName}</td>
                  <td><span className={`badge ${catColors[r.category] || 'badge-gray'}`}>{r.category}</span></td>
                  <td>{r.targetGroup}</td>
                  <td>{r.durationDays} day{r.durationDays > 1 ? 's' : ''}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button>
                      <button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination total={filtered.length} page={page} perPage={PER_PAGE} onPage={setPage} />
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add New Course' : 'Edit Course'}
          onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'add' ? 'Add Course' : 'Save'}</button></>}
        >
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Course Name</label>
              <input className="form-input" value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Group</label>
              <input className="form-input" value={form.targetGroup} onChange={e => setForm(f => ({ ...f, targetGroup: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Days)</label>
              <input type="number" min={1} className="form-input" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
