import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import { PageHeader, FormField } from '../../components/UI';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalEmails() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedTP, setSelectedTP] = useState('');
  const [participants, setParticipants] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/training-programmes?limit=200').then(r => {
      setProgrammes(r.data.data);
      if (r.data.data[0]) setSelectedTP(String(r.data.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedTP) return;
    setLoading(true);
    api.get(`/training-programmes/${selectedTP}/participants`)
      .then(r => {
        const sel = r.data.data.filter(p => p.status === 'Selected');
        setParticipants(sel);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedTP]);

  const toggleAll = e => setSelected(e.target.checked ? participants.map(p => p.id) : []);
  const toggleOne = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const sendEmails = async () => {
    if (!selected.length) return toast.error('Select at least one participant');
    setSending(true);
    try {
      const staffIds = selected.map(id => participants.find(p => p.id === id)?.Staff?.id).filter(Boolean);
      const r = await api.post(`/training-programmes/${selectedTP}/send-emails`, { staffIds });
      toast.success(`Emails sent to ${r.data.results?.length} participants`);
      setSelected([]);
    } catch { toast.error('Failed to send emails'); }
    setSending(false);
  };

  const columns = [
    { key: 'chk', label: <input type="checkbox" className="w-3.5 h-3.5 accent-primary" onChange={toggleAll} checked={selected.length === participants.length && participants.length > 0} />,
      render: (_, r) => <input type="checkbox" className="w-3.5 h-3.5 accent-primary" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} /> },
    { key: 'Staff', label: 'Name', render: (_, r) => <span className="font-semibold">{r.Staff?.name}</span> },
    { key: 'nic',   label: 'NIC',  render: (_, r) => r.Staff?.nic },
    { key: 'desig', label: 'Designation', render: (_, r) => r.Staff?.designation },
    { key: 'inst',  label: 'Institution', render: (_, r) => r.Staff?.Institution?.name || '—' },
    { key: 'email', label: 'Email', render: (_, r) => r.Staff?.email || <span className="text-muted text-xs">No email</span> },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Approval Emails" subtitle="Send confirmation emails to selected participants">
        <button className="btn btn-primary" onClick={sendEmails} disabled={sending || !selected.length}>
          <Mail size={14} /> {sending ? 'Sending…' : `Send Email${selected.length > 1 ? 's' : ''} (${selected.length})`}
        </button>
      </PageHeader>

      <div className="card mb-4 p-4">
        <FormField label="Training Programme">
          <select className="form-select w-80" value={selectedTP} onChange={e => setSelectedTP(e.target.value)}>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.Course?.name} — {p.year}</option>)}
          </select>
        </FormField>
      </div>

      <DataTable columns={columns} data={participants} loading={loading} />
    </div>
  );
}
