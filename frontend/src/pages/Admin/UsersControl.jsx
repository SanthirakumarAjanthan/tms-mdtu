import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import CsvImportModal from '../../components/CsvImportModal';
import { PageHeader, FormField, ActiveBadge } from '../../components/UI';
import { Plus, Pencil, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const NIC_RE   = /^[0-9]{9}[VvXx]$|^[0-9]{12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { nic: '', name: '', email: '', mobile: '', user_type_id: '', password: '', status: 'active' };

export default function UsersControl() {
  const [rows, setRows]       = useState([]);
  const [types, setTypes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [csvOpen, setCsvOpen] = useState(false);

  // Inline role change state: { [userId]: typeId }
  const [roleChanging, setRoleChanging] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ur, tr] = await Promise.all([api.get('/users?limit=500'), api.get('/users/types')]);
      setRows(ur.data.data);
      setTypes(tr.data.data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY); setErrors({}); setModal('add'); };
  const openEdit = row => {
    setForm({ nic: row.nic, name: row.name, email: row.email, mobile: row.mobile, user_type_id: row.user_type_id, password: '', status: row.status });
    setErrors({});
    setModal({ mode: 'edit', id: row.id });
  };
  const close = () => { setModal(null); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.nic)  e.nic  = 'NIC is required';
    else if (!NIC_RE.test(form.nic)) e.nic = 'Invalid NIC format (9V/X or 12 digits)';
    if (!form.name) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Invalid email address';
    if (!form.user_type_id) e.user_type_id = 'Role is required';
    if (modal === 'add' && !form.password) e.password = 'Password is required for new users';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/users', form);
      else await api.put(`/users/${modal.id}`, form);
      toast.success('User saved successfully');
      close(); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving user'); }
    setSaving(false);
  };

  const toggleStatus = async id => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  /* ── Inline role change ── */
  const changeRole = async (userId, newTypeId) => {
    if (!newTypeId) return;
    setRoleChanging(r => ({ ...r, [userId]: true }));
    try {
      await api.put(`/users/${userId}`, { user_type_id: newTypeId });
      toast.success('Role updated');
      setRows(prev => prev.map(r => r.id === userId ? { ...r, user_type_id: Number(newTypeId), UserType: types.find(t => t.id === Number(newTypeId)) } : r));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to change role'); }
    setRoleChanging(r => ({ ...r, [userId]: false }));
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.get('/users/export/excel', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'Users.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const f = k => e => { setForm(x => ({ ...x, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })); };

  const columns = [
    { key: 'nic',  label: 'NIC',  sortable: true },
    { key: 'name', label: 'Name', sortable: true, render: v => <span className="font-semibold">{v}</span> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobile', label: 'Mobile' },
    {
      key: 'UserType',
      label: 'Role',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-blue-400 flex-shrink-0" />
          <select
            className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            value={r.user_type_id || ''}
            disabled={roleChanging[r.id]}
            onChange={e => changeRole(r.id, e.target.value)}
            title="Change role"
          >
            <option value="" disabled>— Role —</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {roleChanging[r.id] && (
            <span className="text-[10px] text-slate-400 animate-pulse">Saving…</span>
          )}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: v => <ActiveBadge active={v === 'active'} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-1.5">
          <button className="icon-btn edit" title="Edit user" onClick={() => openEdit(r)}>
            <Pencil size={13} />
          </button>
          <button
            className={`icon-btn ${r.status === 'active' ? 'danger' : 'success'}`}
            title={r.status === 'active' ? 'Deactivate' : 'Activate'}
            onClick={() => toggleStatus(r.id)}
          >
            {r.status === 'active' ? '⏸' : '▶'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="User Control" subtitle="Manage all system users — change roles directly from the table">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add User</button>
      </PageHeader>

      {/* Role legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">
        <ShieldCheck size={15} className="text-blue-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-blue-700">Tip:</span>
        <span className="text-xs text-blue-600">
          Click any role badge in the <strong>Role</strong> column to instantly change a user's role — no need to open the edit form.
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {types.map(t => (
            <span key={t.id} className="badge badge-blue text-[10px]">{t.name}</span>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onExport={handleExportExcel}
        onImportCsv={() => setCsvOpen(true)}
      />

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Users"
        importUrl="/users/import/csv"
        templateHeaders={['NIC', 'Full Name', 'Email', 'Mobile', 'Role', 'Status']}
        templateFilename="Users"
        onSuccess={load}
      />

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          title={modal === 'add' ? 'Add New User' : 'Edit User'}
          onClose={close}
          size="lg"
          footer={
            <>
              <button className="btn btn-secondary w-full sm:w-auto" onClick={close}>Cancel</button>
              <button className="btn btn-primary w-full sm:w-auto" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save User'}
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="NIC" required error={errors.nic}>
              <input
                className={`form-input${errors.nic ? ' is-invalid' : ''}`}
                value={form.nic}
                onChange={f('nic')}
                placeholder="912345678V or 200012345678"
              />
            </FormField>

            <FormField label="Full Name" required error={errors.name}>
              <input
                className={`form-input${errors.name ? ' is-invalid' : ''}`}
                value={form.name}
                onChange={f('name')}
                placeholder="Full name"
              />
            </FormField>

            <FormField label="Email" required error={errors.email}>
              <input
                type="email"
                className={`form-input${errors.email ? ' is-invalid' : ''}`}
                value={form.email}
                onChange={f('email')}
                placeholder="user@example.com"
              />
            </FormField>

            <FormField label="Mobile">
              <input
                className="form-input"
                value={form.mobile}
                onChange={f('mobile')}
                placeholder="07XXXXXXXX"
              />
            </FormField>

            <FormField label="User Type / Role" required error={errors.user_type_id}>
              <select
                className={`form-select${errors.user_type_id ? ' is-invalid' : ''}`}
                value={form.user_type_id}
                onChange={f('user_type_id')}
              >
                <option value="">— Select Role —</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>

            <FormField
              label={modal === 'add' ? 'Password' : 'New Password'}
              hint={modal !== 'add' ? 'Leave blank to keep current password' : ''}
              error={errors.password}
            >
              <input
                type="password"
                className={`form-input${errors.password ? ' is-invalid' : ''}`}
                value={form.password}
                onChange={f('password')}
                placeholder={modal !== 'add' ? 'Leave blank to keep current' : 'Min. 6 characters'}
              />
            </FormField>

            <FormField label="Status">
              <select className="form-select" value={form.status} onChange={f('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}
