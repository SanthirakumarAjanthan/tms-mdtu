import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import CsvImportModal from '../../components/CsvImportModal';
import { PageHeader, FormField, ActiveBadge } from '../../components/UI';
import { Plus, Pencil, ToggleLeft, ToggleRight, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { institution_id: '', nic: '', name: '', email: '', designation: '', gender: '', district: '', active: true };
const STAFF_CSV_HEADERS = ['NIC', 'Name', 'Email', 'Designation', 'Gender', 'District', 'Institution', 'Active'];

// Sri Lankan NIC validation helper
const validateNIC = (nic) => /^[0-9]{9}[VvXx]$/.test(nic) || /^[0-9]{12}$/.test(nic);

export default function StaffDetails() {
  const [rows, setRows]                   = useState([]);
  const [institutions, setInstitutions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [modal, setModal]                 = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [saving, setSaving]               = useState(false);
  const [csvOpen, setCsvOpen]             = useState(false);
  const [instFilter, setInstFilter]       = useState('');
  const [errors, setErrors]               = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, instRes] = await Promise.all([
        api.get('/staff?limit=500'),
        api.get('/institutions?limit=500'),
      ]);
      setRows(staffRes.data.data);
      setInstitutions(instRes.data.data);
    } catch { toast.error('Failed to load staff'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = ()    => { setForm(EMPTY); setErrors({}); setModal('add'); };
  const openEdit = row   => { setForm({ ...row, institution_id: row.institution_id || '' }); setErrors({}); setModal({ mode: 'edit', id: row.id }); };
  const close    = ()    => { setModal(null); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.nic)  e.nic  = 'NIC is required';
    else if (!validateNIC(form.nic)) e.nic = 'Invalid NIC (9 digits + V/X or 12 digits)';
    if (!form.name) e.name = 'Full name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/staff', form);
      else await api.put(`/staff/${modal.id}`, form);
      toast.success(modal === 'add' ? 'Staff added' : 'Updated successfully');
      close(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    try { await api.delete(`/staff/${id}`); toast.success('Status toggled'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/staff/export/excel', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'Staff_Details.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  // Filter rows by selected institution
  const filteredRows = instFilter
    ? rows.filter(r => String(r.institution_id) === instFilter)
    : rows;

  const columns = [
    { key: 'nic',         label: 'NIC',         sortable: true },
    { key: 'name',        label: 'Name',         sortable: true, render: v => <span className="font-semibold text-slate-800">{v}</span> },
    { key: 'designation', label: 'Designation',  sortable: true },
    { key: 'email',       label: 'Email',         render: v => v ? <span className="text-xs text-slate-500">{v}</span> : <span className="text-muted text-xs">—</span> },
    { key: 'institution', label: 'Institution',  render: (_, r) => r.Institution?.name || '—' },
    { key: 'gender',      label: 'Gender',        sortable: true },
    { key: 'district',    label: 'District',      sortable: true },
    { key: 'active',      label: 'Status',        render: v => <ActiveBadge active={v} /> },
    { key: 'id', label: 'Actions', render: (_, r) => (
      <div className="flex gap-1.5">
        <button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button>
        <button className={`icon-btn ${r.active ? 'danger' : 'success'}`} onClick={() => handleToggle(r.id)}>
          {r.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
        </button>
      </div>
    )},
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Staff Details" subtitle="Manage all staff and officer records">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Staff</button>
      </PageHeader>

      {/* Institution Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
        <Building2 size={16} className="text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter by Institution</span>
        <select
          className="form-select text-sm flex-1 min-w-[180px] max-w-xs"
          value={instFilter}
          onChange={e => setInstFilter(e.target.value)}
        >
          <option value="">All Institutions</option>
          {institutions.map(i => <option key={i.id} value={String(i.id)}>{i.name}</option>)}
        </select>
        {instFilter && (
          <button className="text-xs text-primary hover:underline" onClick={() => setInstFilter('')}>Clear</button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filteredRows.length} records</span>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        loading={loading}
        onExport={handleExportExcel}
        onImportCsv={() => setCsvOpen(true)}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Staff Details"
        importUrl="/staff/import/csv"
        templateHeaders={STAFF_CSV_HEADERS}
        templateFilename="Staff_Details"
        onSuccess={load}
      />

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Staff' : 'Edit Staff Record'} onClose={close} size="lg"
          footer={<>
            <button className="btn btn-secondary" onClick={close}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : (modal === 'add' ? 'Add Staff' : 'Save Changes')}
            </button>
          </>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="NIC No." required>
              <input
                className={`form-input ${errors.nic ? 'border-red-400 focus:ring-red-300' : ''}`}
                value={form.nic}
                onChange={e => { setForm(f => ({...f, nic: e.target.value})); setErrors(er => ({...er, nic: ''})); }}
                placeholder="e.g. 912345678V or 200012345678"
              />
              {errors.nic && <p className="text-xs text-red-500 mt-0.5">{errors.nic}</p>}
            </FormField>
            <FormField label="Full Name" required>
              <input
                className={`form-input ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                value={form.name}
                onChange={e => { setForm(f => ({...f, name: e.target.value})); setErrors(er => ({...er, name: ''})); }}
              />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </FormField>
            <FormField label="Designation">
              <input className="form-input" value={form.designation} onChange={e => setForm(f => ({...f, designation: e.target.value}))} />
            </FormField>
            <FormField label="Email">
              <input type="email" className="form-input" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="e.g. user@example.com" />
            </FormField>
            <FormField label="Institution">
              <div className="flex gap-2">
                <select className="form-select flex-1" value={form.institution_id} onChange={e => setForm(f => ({...f, institution_id: e.target.value}))}>
                  <option value="">— Select —</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            </FormField>
            <FormField label="Gender">
              <select className="form-select" value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}>
                <option value="">— Select —</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="District">
              <input className="form-input" value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} />
            </FormField>
            <div className="col-span-full flex items-center gap-3">
              <input type="checkbox" id="active-chk" className="w-4 h-4 accent-primary" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} />
              <label htmlFor="active-chk" className="text-sm text-slate-600">Active</label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
