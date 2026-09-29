import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import CsvImportModal from '../../components/CsvImportModal';
import { PageHeader, FormField, ActiveBadge } from '../../components/UI';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RP_CSV_HEADERS = ['Name', 'Designation', 'Institution', 'Qualification', 'Mobile', 'Email', 'Address', 'Active'];

export default function ResourcePersons() {
  const [rows, setRows]     = useState([]);
  const [insts, setInsts]   = useState([]);
  const [quals, setQuals]   = useState([]);
  const [pays, setPays]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ name: '', designation: '', institution_id: '', address: '', mobile: '', email: '', qualification_id: '', payment_id: '', active: true });
  const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, iRes, qRes, pRes] = await Promise.all([
        api.get('/resource-persons?limit=500'),
        api.get('/institutions?limit=500'),
        api.get('/resource-qualifications?limit=50'),
        api.get('/resource-payments?limit=50'),
      ]);
      setRows(rRes.data.data); setInsts(iRes.data.data); setQuals(qRes.data.data); setPays(pRes.data.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const EMPTY = { name: '', designation: '', institution_id: '', address: '', mobile: '', email: '', qualification_id: '', payment_id: '', active: true };
  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = row => { setForm({ ...row }); setModal({ mode: 'edit', id: row.id }); };
  const close = () => setModal(null);
  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/resource-persons', form);
      else await api.put(`/resource-persons/${modal.id}`, form);
      toast.success('Saved'); close(); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };
  const del = async id => {
    if (!window.confirm('Deactivate this person?')) return;
    try { await api.delete(`/resource-persons/${id}`); toast.success('Deactivated'); load(); } catch { toast.error('Error'); }
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/resource-persons/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'Resource_Persons.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('CSV export failed'); }
  };

  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v, r) => <div><div className="font-semibold">{v}</div><div className="text-[11px] text-muted">{r.designation}</div></div> },
    { key: 'Institution', label: 'Institution', render: (_, r) => r.Institution?.name || '—' },
    { key: 'ResourceQualification', label: 'Qualification', render: (_, r) => r.ResourceQualification?.name || '—' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email',  label: 'Email' },
    { key: 'ResourcePayment', label: 'Rate (Rs.)', render: (_, r) => r.ResourcePayment ? `Rs. ${Number(r.ResourcePayment.rate).toLocaleString()}` : '—' },
    { key: 'active', label: 'Status', render: v => <ActiveBadge active={v} /> },
    { key: 'id', label: 'Actions', render: (_, r) => (
      <div className="flex gap-1.5">
        <button className="icon-btn edit" onClick={() => openEdit(r)}><Pencil size={13} /></button>
        <button className="icon-btn danger" onClick={() => del(r.id)}><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Resource Persons" subtitle="Manage training facilitators and lecturers">
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Resource Person</button>
      </PageHeader>
      <DataTable
        columns={columns} data={rows} loading={loading}
        onExportCsv={handleExportCsv}
        onImportCsv={() => setCsvOpen(true)}
      />

      <CsvImportModal
        open={csvOpen} onClose={() => setCsvOpen(false)}
        title="Resource Persons" importUrl="/resource-persons/import/csv"
        templateHeaders={RP_CSV_HEADERS} templateFilename="Resource_Persons" onSuccess={load}
      />

      {modal && (
        <Modal title={modal === 'add' ? 'Add Resource Person' : 'Edit Resource Person'} onClose={close} size="lg"
          footer={<><button className="btn btn-secondary" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required><input className="form-input" value={form.name} onChange={f('name')} /></FormField>
            <FormField label="Designation"><input className="form-input" value={form.designation} onChange={f('designation')} /></FormField>
            <FormField label="Institution">
              <select className="form-select" value={form.institution_id} onChange={f('institution_id')}>
                <option value="">— Select —</option>
                {insts.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </FormField>
            <FormField label="Qualification">
              <select className="form-select" value={form.qualification_id} onChange={f('qualification_id')}>
                <option value="">— Select —</option>
                {quals.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
              </select>
            </FormField>
            <FormField label="Payment Rate">
              <select className="form-select" value={form.payment_id} onChange={f('payment_id')}>
                <option value="">— Select —</option>
                {pays.map(p => <option key={p.id} value={p.id}>{p.qualification} — Rs. {p.rate}</option>)}
              </select>
            </FormField>
            <FormField label="Mobile"><input className="form-input" value={form.mobile} onChange={f('mobile')} /></FormField>
            <FormField label="Email"><input type="email" className="form-input" value={form.email} onChange={f('email')} /></FormField>
            <div className="col-span-2"><FormField label="Address"><textarea className="form-input" rows={2} value={form.address} onChange={f('address')} /></FormField></div>
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.active} onChange={e => setForm(x => ({...x, active: e.target.checked}))} />
              <span className="text-sm text-slate-600">Active</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
