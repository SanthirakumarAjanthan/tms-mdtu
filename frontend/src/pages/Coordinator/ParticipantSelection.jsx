import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import { PageHeader, FormField, StatusBadge } from '../../components/UI';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParticipantSelection() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedTP, setSelectedTP] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);

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
      .then(r => { setParticipants(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedTP]);

  const updateStatus = async (appId, status) => {
    setSaving(appId);
    try {
      await api.put(`/training-programmes/${selectedTP}/participants/${appId}`, { status });
      toast.success(`Marked as ${status}`);
      setParticipants(prev => prev.map(p => p.id === appId ? { ...p, status } : p));
    } catch { toast.error('Failed'); }
    setSaving(null);
  };

  const handleExportExcel = () => {
    if (!selectedTP) return toast.error('Select a programme first');
    const tp = programmes.find(p => String(p.id) === selectedTP);
    try {
      const rows = participants.map((p, i) => ({
        '#': i + 1,
        Name: p.Staff?.name || '',
        NIC: p.Staff?.nic || '',
        Designation: p.Staff?.designation || '',
        Institution: p.Staff?.Institution?.name || '',
        District: p.Staff?.district || '',
        Status: p.status || '',
      }));

      const headers = ['#', 'Name', 'NIC', 'Designation', 'Institution', 'District', 'Status'];
      const csv = [
        '\uFEFF' + headers.join(','),
        ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Participants_${(tp?.Course?.name || selectedTP).replace(/[^a-z0-9]/gi, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch { toast.error('Export failed'); }
  };


  const columns = [
    { key: 'Staff', label: 'Name', render: (_, r) => (
      <div><div className="font-semibold">{r.Staff?.name}</div><div className="text-[11px] text-muted">{r.Staff?.nic}</div></div>
    )},
    { key: 'designation', label: 'Designation', render: (_, r) => r.Staff?.designation },
    { key: 'institution',  label: 'Institution', render: (_, r) => r.Staff?.Institution?.name || '—' },
    { key: 'district',     label: 'District',    render: (_, r) => r.Staff?.district },
    { key: 'status',       label: 'Status',      render: v => <StatusBadge status={v} /> },
    { key: 'id', label: 'Action', render: (_, r) => (
      <div className="flex gap-1.5">
        <button className="icon-btn success" title="Select" disabled={saving === r.id} onClick={() => updateStatus(r.id, 'Selected')}><Check size={13} /></button>
        <button className="icon-btn danger" title="Not Selected" disabled={saving === r.id} onClick={() => updateStatus(r.id, 'Not Selected')}><X size={13} /></button>
      </div>
    )},
  ];

  const tp = programmes.find(p => String(p.id) === selectedTP);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Participant Selection" subtitle="Select participants for training programmes" />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-4 flex items-center gap-4 flex-wrap">
        <FormField label="Training Programme">
          <select className="form-select w-full sm:w-80" value={selectedTP} onChange={e => setSelectedTP(e.target.value)}>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.Course?.name} — {p.year}</option>)}
          </select>
        </FormField>
        {tp && <p className="text-sm text-muted mt-4 sm:mt-0">Dates: <span className="font-medium text-slate-700">{tp.dates?.map(d => d.date).join(', ')}</span></p>}
      </div>
      <DataTable
        columns={columns}
        data={participants}
        loading={loading}
        onExport={participants.length > 0 ? handleExportExcel : undefined}
      />
    </div>
  );
}
