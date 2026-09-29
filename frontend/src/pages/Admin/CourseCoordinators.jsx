import { useState } from 'react';
import { COORDINATORS } from '../../data/mockData';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import TablePagination from '../../components/TablePagination';

const EMPTY = { name: '', nic: '', designation: '', division: '' };
const PER_PAGE = 5;

export default function CourseCoordinators() {
  const [data, setData]   = useState(COORDINATORS);
  const [query, setQuery] = useState('');
  const [page, setPage]   = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(EMPTY);

  const filtered = data.filter(r =>
    [r.name, r.nic, r.designation, r.division].some(v =>
      v.toLowerCase().includes(query.toLowerCase())
    )
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd  = ()    => { setForm(EMPTY); setModal('add'); };
  const openEdit = row   => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close    = ()    => setModal(null);

  const save = () => {
    if (modal === 'add') setData(d => [...d, { ...form, id: Date.now() }]);
    else setData(d => d.map(r => r.id === modal.id ? { ...form, id: modal.id } : r));
    close();
  };

  const del = id => { if (window.confirm('Remove this coordinator?')) setData(d => d.filter(r => r.id !== id)); };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Course Coordinators</h1>
          <p className="subtitle">Assign and manage course coordinators</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Coordinator</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🧑‍💼</div>
          <div className="stat-info"><div className="stat-value">{data.length}</div><div className="stat-label">Coordinators</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Coordinator List</div>
            <div className="card-subtitle">{filtered.length} records</div>
          </div>
          <div className="search-bar">
            <Search size={14} color="var(--clr-text-muted)" />
            <input placeholder="Search…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card-body-flush tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>#</th><th>NIC</th><th>Name</th><th>Designation</th><th>Division</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><span className="es-icon">🧑‍💼</span><span className="es-title">No coordinators found</span></div></td></tr>
              ) : paged.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-muted">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="fw-500">{r.nic}</td>
                  <td className="fw-600">{r.name}</td>
                  <td>{r.designation}</td>
                  <td><span className="badge badge-blue">{r.division}</span></td>
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
          title={modal === 'add' ? 'Add Coordinator' : 'Edit Coordinator'}
          onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save}>{modal === 'add' ? 'Add' : 'Save'}</button></>}
        >
          <div className="form-grid">
            {[{ label: 'NIC', key: 'nic' }, { label: 'Full Name', key: 'name' }, { label: 'Designation', key: 'designation' }, { label: 'Division', key: 'division' }].map(({ label, key }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
