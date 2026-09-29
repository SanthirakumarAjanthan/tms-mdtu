import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import CsvImportModal from '../../components/CsvImportModal';
import { PageHeader, FormField, ActiveBadge } from '../../components/UI';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── CSV export helper ─────────────────────────────────────── */
const downloadCsv = async (url, filename) => {
  try {
    const res = await api.get(url, { responseType: 'blob' });
    const link = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = link; a.download = filename; a.click();
    URL.revokeObjectURL(link);
  } catch { toast.error('CSV export failed'); }
};

// ─── Institutions ────────────────────────────────────────────
export function Institutions() {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ hod: '', name: '', address: '', active: true });
  const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/institutions?limit=500'); setRows(r.data.data); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({ hod: '', name: '', address: '', active: true }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close = () => setModal(null);
  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/institutions', form);
      else await api.put(`/institutions/${modal.id}`, form);
      toast.success('Saved'); close(); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };
  const del = async id => {
    if (!window.confirm('Deactivate this institution?')) return;
    try { await api.delete(`/institutions/${id}`); toast.success('Deactivated'); load(); }
    catch { toast.error('Error'); }
  };

  const columns = [
    { key: 'hod',    label: 'HOD',         sortable: true },
    { key: 'name',   label: 'Institution', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'address',label: 'Address',     sortable: true },
    { key: 'active', label: 'Status',      render: v => <ActiveBadge active={v} /> },
    { key: 'id',     label: 'Actions',     render: (_, r) => (
      <div className="flex gap-1.5">
        <button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button>
        <button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Institutions" subtitle="Manage government institutions and departments">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Institution</button>
      </PageHeader>
      <DataTable
        columns={columns} data={rows} loading={loading}
        onExportCsv={() => downloadCsv('/institutions/export/csv', 'Institutions.csv')}
        onImportCsv={() => setCsvOpen(true)}
      />
      <CsvImportModal
        open={csvOpen} onClose={() => setCsvOpen(false)}
        title="Institutions" importUrl="/institutions/import/csv"
        templateHeaders={['HOD Title', 'Institution Name', 'Address', 'Active']}
        templateFilename="Institutions" onSuccess={load}
      />
      {modal && (
        <Modal title={modal === 'add' ? 'Add Institution' : 'Edit Institution'} onClose={close} size="md"
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <div className="grid gap-4">
            <FormField label="HOD Title"><input className="form-input" value={form.hod} onChange={e => setForm(f => ({...f, hod: e.target.value}))} /></FormField>
            <FormField label="Institution Name" required><input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></FormField>
            <FormField label="Address"><textarea className="form-input" rows={2} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></FormField>
            <div className="flex items-center gap-3"><input type="checkbox" className="w-4 h-4 accent-primary" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} /><span className="text-sm text-slate-600">Active</span></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Courses ─────────────────────────────────────────────────
export function Courses() {
  const CATS = ['Soft Skills', 'Finance', 'ICT', 'Admin', 'Legal', 'Special', 'Technology', 'Planning', 'Language', 'Procurement', 'Other'];
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); const [form, setForm] = useState({ category: '', name: '', target_group: '', duration: 1, active: true }); const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get('/courses?limit=500'); setRows(r.data.data); } catch { toast.error('Failed'); } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm({ category: '', name: '', target_group: '', duration: 1, active: true }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close = () => setModal(null);
  const save = async () => { setSaving(true); try { if (modal === 'add') await api.post('/courses', form); else await api.put(`/courses/${modal.id}`, form); toast.success('Saved'); close(); load(); } catch (e) { toast.error(e.response?.data?.message || 'Error'); } setSaving(false); };
  const del = async id => { if (!window.confirm('Deactivate?')) return; try { await api.delete(`/courses/${id}`); toast.success('Done'); load(); } catch { toast.error('Error'); } };
  const catColors = { 'Soft Skills': 'badge-yellow', Finance: 'badge-green', ICT: 'badge-blue', Admin: 'badge-gray', Legal: 'badge-purple', Planning: 'badge-blue' };
  const columns = [
    { key: 'category', label: 'Category', sortable: true, render: v => <span className={`badge ${catColors[v] || 'badge-gray'}`}>{v}</span> },
    { key: 'name',     label: 'Training Programme', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'target_group', label: 'Target Group' },
    { key: 'duration', label: 'Duration (Days)', sortable: true },
    { key: 'active',   label: 'Status', render: v => <ActiveBadge active={v} /> },
    { key: 'id',       label: 'Actions', render: (_, r) => <div className="flex gap-1.5"><button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button><button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button></div> },
  ];
  return (
    <div className="animate-fade-up">
      <PageHeader title="Courses" subtitle="Training programme catalogue">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Course</button>
      </PageHeader>
      <DataTable
        columns={columns} data={rows} loading={loading}
        onExportCsv={() => downloadCsv('/courses/export/csv', 'Courses.csv')}
        onImportCsv={() => setCsvOpen(true)}
      />
      <CsvImportModal
        open={csvOpen} onClose={() => setCsvOpen(false)}
        title="Courses" importUrl="/courses/import/csv"
        templateHeaders={['Category', 'Training Programme Name', 'Target Group', 'Duration (Days)', 'Active']}
        templateFilename="Courses" onSuccess={load}
      />
      {modal && (
        <Modal title={modal === 'add' ? 'Add Course' : 'Edit Course'} onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-full"><FormField label="Training Programme Name" required><input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></FormField></div>
            <FormField label="Category"><select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}><option value="">— Select —</option>{CATS.map(c => <option key={c}>{c}</option>)}</select></FormField>
            <FormField label="Duration (Days)"><input type="number" min={1} className="form-input" value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} /></FormField>
            <div className="col-span-full"><FormField label="Target Group"><textarea className="form-input" rows={2} value={form.target_group} onChange={e => setForm(f => ({...f, target_group: e.target.value}))} /></FormField></div>
            <div className="col-span-full flex items-center gap-3"><input type="checkbox" className="w-4 h-4 accent-primary" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} /><span className="text-sm text-slate-600">Active</span></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Course Coordinators ──────────────────────────────────────
const NIC_RE = /^[0-9]{9}[VvXx]$|^[0-9]{12}$/;

export function CourseCoordinatorsList() {
  const [rows, setRows]     = useState([]);
  const [users, setUsers]   = useState([]);
  const [types, setTypes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ nic: '', name: '', designation: '', linked_user_id: '', new_role_id: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes, tRes] = await Promise.all([
        api.get('/coordinators?limit=500'),
        api.get('/users?limit=500'),
        api.get('/users/types'),
      ]);
      setRows(cRes.data.data);
      setUsers(uRes.data.data);
      setTypes(tRes.data.data);
    } catch { toast.error('Failed'); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({ nic: '', name: '', designation: '', linked_user_id: '', new_role_id: '' }); setErrors({}); setModal('add'); };
  const openEdit = row => { setForm({ nic: row.nic || '', name: row.name || '', designation: row.designation || '', linked_user_id: row.linked_user_id || '', new_role_id: '' }); setErrors({}); setModal({ mode: 'edit', id: row.id }); };
  const close = () => { setModal(null); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.nic)          e.nic  = 'NIC is required';
    else if (!NIC_RE.test(form.nic)) e.nic = 'Invalid NIC — use 9 digits + V/X or 12 digits';
    if (!form.name)         e.name = 'Full name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { nic: form.nic, name: form.name, designation: form.designation, linked_user_id: form.linked_user_id || null };
      if (modal === 'add') await api.post('/coordinators', payload);
      else {
        await api.put(`/coordinators/${modal.id}`, payload);
        // If a new role was selected, also update that user's role
        if (form.linked_user_id && form.new_role_id) {
          await api.put(`/users/${form.linked_user_id}`, { user_type_id: form.new_role_id });
          toast.success('Role updated');
        }
      }
      toast.success('Saved'); close(); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const del = async id => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/coordinators/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
  };

  const columns = [
    { key: 'nic',         label: 'NIC',         sortable: true },
    { key: 'name',        label: 'Name',         sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'designation', label: 'Designation',  sortable: true },
    { key: 'id', label: 'Actions', render: (_, r) => <div className="flex gap-1.5"><button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button><button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button></div> },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Course Coordinators" subtitle="Assign coordinators to training programmes">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Coordinator</button>
      </PageHeader>
      <DataTable columns={columns} data={rows} loading={loading} />
      {modal && (
        <Modal title={modal === 'add' ? 'Add Coordinator' : 'Edit Coordinator'} onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <div className="grid gap-4">
            <FormField label="NIC" required>
              <input
                className={`form-input ${errors.nic ? 'border-red-400' : ''}`}
                value={form.nic}
                placeholder="e.g. 912345678V or 200012345678"
                onChange={e => { setForm(f => ({...f, nic: e.target.value})); setErrors(er => ({...er, nic: ''})); }}
              />
              {errors.nic && <p className="text-xs text-red-500 mt-0.5">{errors.nic}</p>}
            </FormField>
            <FormField label="Full Name" required>
              <input
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={e => { setForm(f => ({...f, name: e.target.value})); setErrors(er => ({...er, name: ''})); }}
              />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </FormField>
            <FormField label="Designation">
              <input className="form-input" value={form.designation} onChange={e => setForm(f => ({...f, designation: e.target.value}))} />
            </FormField>
            <FormField label="Link to System User (optional)" hint="Select an existing user account to link with this coordinator">
              <select className="form-select" value={form.linked_user_id} onChange={e => setForm(f => ({...f, linked_user_id: e.target.value, new_role_id: ''}))}>
                <option value="">— None / Unlink —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </FormField>
            {form.linked_user_id && modal?.mode === 'edit' && (
              <FormField label="Change Role for Linked User" hint="This will update the selected user's system role">
                <select className="form-select" value={form.new_role_id} onChange={e => setForm(f => ({...f, new_role_id: e.target.value}))}>
                  <option value="">— Keep current role —</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </FormField>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}


// ─── Resource Qualifications ──────────────────────────────────
export function ResourceQualifications() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); const [form, setForm] = useState({ name: '' }); const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get('/resource-qualifications?limit=200'); setRows(r.data.data); } catch { toast.error('Failed'); } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm({ name: '' }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close = () => setModal(null);
  const save = async () => { setSaving(true); try { if (modal === 'add') await api.post('/resource-qualifications', form); else await api.put(`/resource-qualifications/${modal.id}`, form); toast.success('Saved'); close(); load(); } catch (e) { toast.error(e.response?.data?.message || 'Error'); } setSaving(false); };
  const del = async id => { if (!window.confirm('Delete?')) return; try { await api.delete(`/resource-qualifications/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Error'); } };
  const columns = [
    { key: 'name', label: 'Qualification', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'id',   label: 'Edit', render: (_, r) => <div className="flex gap-1.5"><button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button><button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button></div> },
  ];
  return (
    <div className="animate-fade-up">
      <PageHeader title="Resource Qualifications" subtitle="Manage qualification types for resource persons">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Qualification</button>
      </PageHeader>
      <DataTable
        columns={columns} data={rows} loading={loading}
        onExportCsv={() => downloadCsv('/resource-qualifications/export/csv', 'Resource_Qualifications.csv')}
        onImportCsv={() => setCsvOpen(true)}
      />
      <CsvImportModal
        open={csvOpen} onClose={() => setCsvOpen(false)}
        title="Resource Qualifications" importUrl="/resource-qualifications/import/csv"
        templateHeaders={['Qualification']} templateFilename="Resource_Qualifications" onSuccess={load}
      />
      {modal && (
        <Modal title={modal === 'add' ? 'Add Qualification' : 'Edit Qualification'} onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <FormField label="Qualification Name" required><input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></FormField>
        </Modal>
      )}
    </div>
  );
}

// ─── Resource Payments ────────────────────────────────────────
export function ResourcePayments() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); const [form, setForm] = useState({ qualification: '', rate: '' }); const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get('/resource-payments?limit=200'); setRows(r.data.data); } catch { toast.error('Failed'); } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm({ qualification: '', rate: '' }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close = () => setModal(null);
  const save = async () => { setSaving(true); try { if (modal === 'add') await api.post('/resource-payments', form); else await api.put(`/resource-payments/${modal.id}`, form); toast.success('Saved'); close(); load(); } catch (e) { toast.error(e.response?.data?.message || 'Error'); } setSaving(false); };
  const del = async id => { if (!window.confirm('Delete?')) return; try { await api.delete(`/resource-payments/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Error'); } };
  const columns = [
    { key: 'qualification', label: 'Qualification', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'rate',          label: 'Rate (Rs.)',     sortable: true, render: v => `Rs. ${Number(v).toLocaleString()}` },
    { key: 'id', label: 'Edit', render: (_, r) => <div className="flex gap-1.5"><button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button><button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button></div> },
  ];
  return (
    <div className="animate-fade-up">
      <PageHeader title="Resource Payments" subtitle="Set payment rates per qualification">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Payment Rate</button>
      </PageHeader>
      <DataTable
        columns={columns} data={rows} loading={loading}
        onExportCsv={() => downloadCsv('/resource-payments/export/csv', 'Resource_Payments.csv')}
        onImportCsv={() => setCsvOpen(true)}
      />
      <CsvImportModal
        open={csvOpen} onClose={() => setCsvOpen(false)}
        title="Resource Payments" importUrl="/resource-payments/import/csv"
        templateHeaders={['Qualification', 'Rate (Rs.)']} templateFilename="Resource_Payments" onSuccess={load}
      />
      {modal && (
        <Modal title={modal === 'add' ? 'Add Payment Rate' : 'Edit Payment Rate'} onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <div className="grid gap-4">
            <FormField label="Qualification"><input className="form-input" value={form.qualification} onChange={e => setForm(f => ({...f, qualification: e.target.value}))} /></FormField>
            <FormField label="Rate (Rs.)"><input type="number" className="form-input" value={form.rate} onChange={e => setForm(f => ({...f, rate: e.target.value}))} /></FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Food Master ──────────────────────────────────────────────
export function FoodMaster() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); const [form, setForm] = useState({ item: '', cost: '' }); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get('/food-items?limit=50'); setRows(r.data.data); } catch { toast.error('Failed'); } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm({ item: '', cost: '' }); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close = () => setModal(null);
  const save = async () => { setSaving(true); try { if (modal === 'add') await api.post('/food-items', form); else await api.put(`/food-items/${modal.id}`, form); toast.success('Saved'); close(); load(); } catch (e) { toast.error(e.response?.data?.message || 'Error'); } setSaving(false); };
  const del = async id => { if (!window.confirm('Delete?')) return; try { await api.delete(`/food-items/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Error'); } };
  const columns = [
    { key: 'item', label: 'Food Item', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'cost', label: 'Cost (Rs.)', sortable: true, render: v => `Rs. ${Number(v).toLocaleString()}` },
    { key: 'id',   label: 'Edit', render: (_, r) => <div className="flex gap-1.5"><button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button><button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button></div> },
  ];
  return (
    <div className="animate-fade-up">
      <PageHeader title="Food Master" subtitle="Manage food options and costs for training sessions"><button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Item</button></PageHeader>
      <DataTable columns={columns} data={rows} loading={loading} />
      {modal && (
        <Modal title={modal === 'add' ? 'Add Food Item' : 'Edit Food Item'} onClose={close}
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <div className="grid gap-4">
            <FormField label="Item Name" required><input className="form-input" value={form.item} onChange={e => setForm(f => ({...f, item: e.target.value}))} /></FormField>
            <FormField label="Cost (Rs.)"><input type="number" className="form-input" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} /></FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}
