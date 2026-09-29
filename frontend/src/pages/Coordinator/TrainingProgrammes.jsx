import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import CsvImportModal from '../../components/CsvImportModal';
import { PageHeader, StatusBadge } from '../../components/UI';
import { Plus, Eye, Pencil, Trash2, Search, X, PlusCircle, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
  year: new Date().getFullYear(),
  course_id: '', coordinator_id: '', mode: 'In-Class', status: 'Draft', venue: '',
  dates: [], resourcePersonIds: [],
};

/* ─── Inline field error helper ────────────────────────────── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
      <AlertCircle size={11} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

/* ─── FormField with error support ─────────────────────────── */
function FormField({ label, required, error, hint, children }) {
  return (
    <div className="flex flex-col gap-0">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

/* ─── Searchable Multi-Select for Resource Persons ─────────── */
function ResourcePersonMultiSelect({ rps, selected, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return rps;
    const q = search.toLowerCase();
    return rps.filter(r => r.name.toLowerCase().includes(q) || (r.designation || '').toLowerCase().includes(q));
  }, [rps, search]);

  const toggle = id => onChange(
    selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]
  );

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Search input */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
        <Search size={13} className="text-slate-400 flex-shrink-0" />
        <input
          className="text-xs outline-none bg-transparent flex-1 placeholder:text-slate-400 min-w-0"
          placeholder="Search resource persons…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500 flex-shrink-0"><X size={12} /></button>}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-2 bg-blue-50/40 border-b border-slate-100">
          {selected.map(id => {
            const rp = rps.find(r => r.id === id);
            return rp ? (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                {rp.name}
                <button onClick={() => toggle(id)} className="hover:text-red-500 ml-0.5"><X size={10} /></button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* List */}
      <div className="max-h-36 overflow-y-auto divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No resource persons found</p>
        ) : filtered.map(rp => (
          <label key={rp.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-blue-50/40 transition-colors">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-blue-600 flex-shrink-0"
              checked={selected.includes(rp.id)}
              onChange={() => toggle(rp.id)}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-700 truncate">{rp.name}</div>
              {rp.designation && <div className="text-[11px] text-slate-400 truncate">{rp.designation}</div>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ─── Budget Section ────────────────────────────────────────── */
function BudgetSection({ tpId }) {
  const [items, setItems] = useState([]);
  const [form, setForm]   = useState({ description: '', amount: '', category: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const loadBudget = useCallback(async () => {
    try {
      const r = await api.get(`/training-programmes/${tpId}/budget`);
      setItems(r.data.data || []);
    } catch { /* silent */ }
  }, [tpId]);

  useEffect(() => { if (tpId) loadBudget(); }, [tpId, loadBudget]);

  const resetForm = () => { setForm({ description: '', amount: '', category: '' }); setEditId(null); setErrors({}); };

  const validateBudget = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validateBudget()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/training-programmes/${tpId}/budget/${editId}`, form);
        toast.success('Updated');
      } else {
        await api.post(`/training-programmes/${tpId}/budget`, form);
        toast.success('Added');
      }
      resetForm(); loadBudget();
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving budget item'); }
    setSaving(false);
  };

  const startEdit = item => {
    setForm({ description: item.description || '', amount: item.amount || '', category: item.category || '' });
    setEditId(item.id);
    setErrors({});
  };

  const del = async id => {
    if (!window.confirm('Remove this budget item?')) return;
    try { await api.delete(`/training-programmes/${tpId}/budget/${id}`); toast.success('Removed'); loadBudget(); }
    catch { toast.error('Failed to remove budget item'); }
  };

  const total = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <div className="space-y-3">
      {/* Add/Edit form */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {editId ? 'Edit Budget Item' : 'Add Budget Item'}
        </p>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <input
              className={`form-input text-sm${errors.description ? ' is-invalid' : ''}`}
              placeholder="Description *"
              value={form.description}
              onChange={e => { setForm(f => ({...f, description: e.target.value})); setErrors(er => ({...er, description: ''})); }}
            />
            <FieldError msg={errors.description} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <input
                className="form-input text-sm"
                placeholder="Category (optional)"
                value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))}
              />
            </div>
            <div>
              <input
                type="number"
                className={`form-input text-sm${errors.amount ? ' is-invalid' : ''}`}
                placeholder="Amount (Rs.) *"
                value={form.amount}
                onChange={e => { setForm(f => ({...f, amount: e.target.value})); setErrors(er => ({...er, amount: ''})); }}
              />
              <FieldError msg={errors.amount} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="btn btn-primary btn-sm text-xs" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : (editId ? 'Update' : <><PlusCircle size={12} className="inline mr-1" />Add</>)}
          </button>
          {editId && <button className="btn btn-secondary btn-sm text-xs" onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      {/* Budget table */}
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No budget items yet</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 -mx-0">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500">Description</th>
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500">Category</th>
                <th className="px-3 py-2 text-right text-[11px] font-bold uppercase text-slate-500">Amount (Rs.)</th>
                <th className="px-3 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-700">{item.description}</td>
                  <td className="px-3 py-2 text-slate-500">{item.category || '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">
                    {Number(item.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-end">
                      <button className="icon-btn edit" onClick={() => startEdit(item)}><Edit2 size={11} /></button>
                      <button className="icon-btn danger" onClick={() => del(item.id)}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={2} className="px-3 py-2 text-xs font-bold text-blue-700 uppercase">Total</td>
                <td className="px-3 py-2 text-right text-sm font-black text-blue-700">
                  Rs. {total.toLocaleString()}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══ Main Training Programmes Component ═══════════════════════ */
export default function TrainingProgrammes() {
  const [rows, setRows]           = useState([]);
  const [courses, setCourses]     = useState([]);
  const [coords, setCoords]       = useState([]);
  const [rps, setRps]             = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [csvOpen, setCsvOpen]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tpRes, cRes, coRes, rpRes] = await Promise.all([
        api.get('/training-programmes?limit=200'),
        api.get('/courses?limit=200'),
        api.get('/coordinators?limit=200'),
        api.get('/resource-persons?limit=200'),
      ]);
      setRows(tpRes.data.data);
      setCourses(cRes.data.data);
      setCoords(coRes.data.data);
      setRps(rpRes.data.data);
    } catch { toast.error('Failed to load data. Please refresh.'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => {
    setForm({ ...EMPTY, course_id: courses[0]?.id || '', coordinator_id: coords[0]?.id || '' });
    setErrors({});
    setActiveTab('details');
    setModal('add');
  };

  const openEdit = row => {
    setForm({
      year: row.year, course_id: row.course_id, coordinator_id: row.coordinator_id,
      mode: row.mode, status: row.status, venue: row.venue || '',
      dates: row.dates?.map(d => d.date) || [],
      resourcePersonIds: row.TpResourcePeople?.map(t => t.resource_person_id) || [],
    });
    setErrors({});
    setActiveTab('details');
    setModal({ mode: 'edit', id: row.id });
  };

  const openView = row => setModal({ mode: 'view', row });

  const close = () => {
    setModal(null);
    setDateInput('');
    setActiveTab('details');
    setErrors({});
  };

  const addDate = () => {
    if (!dateInput) return toast.error('Please pick a date first');
    setForm(f => ({ ...f, dates: [...new Set([...f.dates, dateInput])] }));
    setDateInput('');
  };
  const removeDate = d => setForm(f => ({ ...f, dates: f.dates.filter(x => x !== d) }));

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.year || isNaN(Number(form.year)) || Number(form.year) < 2000)
      e.year = 'Enter a valid year (e.g. 2025)';
    if (!form.course_id)
      e.course_id = 'Please select a course';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/training-programmes', form);
      else await api.put(`/training-programmes/${modal.id}`, form);
      toast.success('Programme saved successfully');
      close();
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save programme';
      toast.error(msg);
    }
    setSaving(false);
  };

  const del = async id => {
    if (!window.confirm('Delete this programme? This cannot be undone.')) return;
    try {
      await api.delete(`/training-programmes/${id}`);
      toast.success('Programme deleted');
      load();
    } catch {
      toast.error('Failed to delete programme');
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/training-programmes/export/excel', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'Training_Programmes.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed. Please try again.'); }
  };

  const columns = [
    { key: 'year',  label: 'Year', sortable: true },
    { key: 'Course', label: 'Course', render: (_, r) => <span className="font-semibold">{r.Course?.name || '—'}</span> },
    { key: 'dates', label: 'Date(s)', render: (_, r) => r.dates?.map(d => d.date).join(', ') || '—' },
    { key: 'mode',  label: 'Mode', render: v => <span className="badge badge-gray">{v}</span> },
    { key: 'coordinator', label: 'Coordinator', render: (_, r) => r.coordinator?.name || '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'id', label: 'Actions', render: (_, r) => (
      <div className="flex gap-1">
        <button className="icon-btn" onClick={() => openView(r)}><Eye size={13} /></button>
        <button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button>
        <button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button>
      </div>
    )},
  ];

  const isEditOrAdd = modal === 'add' || modal?.mode === 'edit';
  const currentId   = modal?.mode === 'edit' ? modal.id : null;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Training Programmes" subtitle="Manage all scheduled training events">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Create Programme</button>
      </PageHeader>

      <DataTable
        columns={columns} data={rows} loading={loading}
        onExport={handleExportExcel}
        onImportCsv={() => setCsvOpen(true)}
      />

      <CsvImportModal
        open={csvOpen} onClose={() => setCsvOpen(false)}
        title="Training Programmes" importUrl="/training-programmes/import/csv"
        templateHeaders={['Year', 'Course', 'Mode', 'Status', 'Venue']}
        templateFilename="Training_Programmes" onSuccess={load}
      />

      {/* ─── Add / Edit Modal ─── */}
      {isEditOrAdd && (
        <Modal
          title={modal === 'add' ? 'Create Training Programme' : 'Edit Training Programme'}
          onClose={close}
          size="xl"
          footer={
            <>
              <button className="btn btn-secondary w-full sm:w-auto" onClick={close}>Cancel</button>
              <button className="btn btn-primary w-full sm:w-auto" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Programme'}
              </button>
            </>
          }
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-5 -mt-1 overflow-x-auto">
            {['details', 'budget'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'budget' ? '💰 Budget / Build Project' : '📋 Programme Details'}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Row 1: Year + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Year" required error={errors.year}>
                  <input
                    type="number"
                    className={`form-input${errors.year ? ' is-invalid' : ''}`}
                    value={form.year}
                    min={2000}
                    max={2100}
                    onChange={e => { setForm(f => ({...f, year: e.target.value})); setErrors(er => ({...er, year: ''})); }}
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={e => setForm(f => ({...f, status: e.target.value}))}
                  >
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </FormField>
              </div>

              {/* Row 2: Course (full width) */}
              <FormField label="Course" required error={errors.course_id}>
                <select
                  className={`form-select${errors.course_id ? ' is-invalid' : ''}`}
                  value={form.course_id}
                  onChange={e => { setForm(f => ({...f, course_id: e.target.value})); setErrors(er => ({...er, course_id: ''})); }}
                >
                  <option value="">— Select Course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>

              {/* Row 3: Coordinator + Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Coordinator">
                  <select
                    className="form-select"
                    value={form.coordinator_id}
                    onChange={e => setForm(f => ({...f, coordinator_id: e.target.value}))}
                  >
                    <option value="">— Select —</option>
                    {coords.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FormField>

                <FormField label="Mode">
                  <select
                    className="form-select"
                    value={form.mode}
                    onChange={e => setForm(f => ({...f, mode: e.target.value}))}
                  >
                    <option>In-Class</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </FormField>
              </div>

              {/* Row 4: Venue (full width) */}
              <FormField label="Venue">
                <input
                  className="form-input"
                  placeholder="Enter venue location…"
                  value={form.venue}
                  onChange={e => setForm(f => ({...f, venue: e.target.value}))}
                />
              </FormField>

              {/* Row 5: Programme Dates */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Programme Dates
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    className="form-input flex-1 min-w-0"
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                  />
                  <button
                    className="btn btn-secondary flex-shrink-0 text-sm"
                    type="button"
                    onClick={addDate}
                  >
                    Add
                  </button>
                </div>
                {form.dates.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No dates added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {form.dates.map(d => (
                      <span
                        key={d}
                        className="badge badge-blue cursor-pointer select-none hover:bg-red-100 hover:text-red-600 hover:border-red-300 transition-colors"
                        onClick={() => removeDate(d)}
                        title="Click to remove"
                      >
                        {d} <X size={10} className="inline ml-0.5" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Resource Persons */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Resource Person(s)
                  {form.resourcePersonIds.length > 0 && (
                    <span className="ml-2 badge badge-blue normal-case tracking-normal">
                      {form.resourcePersonIds.length} selected
                    </span>
                  )}
                </label>
                <ResourcePersonMultiSelect
                  rps={rps.filter(r => r.active)}
                  selected={form.resourcePersonIds}
                  onChange={ids => setForm(f => ({...f, resourcePersonIds: ids}))}
                />
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div>
              {currentId ? (
                <BudgetSection tpId={currentId} />
              ) : (
                <div className="text-center py-10 text-sm text-slate-400 space-y-2">
                  <div className="text-3xl">💾</div>
                  <p className="font-medium">Save the programme first</p>
                  <p className="text-xs">Budget items can be added after saving.</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* ─── View Modal ─── */}
      {modal?.mode === 'view' && (
        <Modal
          title="Programme Details"
          onClose={close}
          size="lg"
          footer={<button className="btn btn-secondary w-full sm:w-auto" onClick={close}>Close</button>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['Course',             modal.row.Course?.name],
              ['Year',               modal.row.year],
              ['Coordinator',        modal.row.coordinator?.name],
              ['Mode',               modal.row.mode],
              ['Venue',              modal.row.venue],
              ['Status',             modal.row.status],
              ['Date(s)',            modal.row.dates?.map(d => d.date).join(', ')],
              ['Resource Person(s)', modal.row.TpResourcePeople?.map(t => t.resourcePerson?.name).filter(Boolean).join(', ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-[11px] text-slate-400 mb-0.5 font-semibold uppercase tracking-wider">{l}</div>
                <div className="text-sm font-semibold text-slate-800">{v || '—'}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
