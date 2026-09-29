import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageHeader, FormField } from '../../components/UI';
import { Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [programmes, setProgrammes]  = useState([]);
  const [selectedTP, setSelectedTP]  = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availDates, setAvailDates]  = useState([]);
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance]  = useState({});
  const [loading, setLoading]        = useState(false);
  const [saving, setSaving]          = useState(false);

  useEffect(() => {
    api.get('/training-programmes?limit=200').then(r => {
      setProgrammes(r.data.data);
      if (r.data.data[0]) setSelectedTP(String(r.data.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedTP) return;
    const tp = programmes.find(p => String(p.id) === selectedTP);
    const dates = tp?.dates?.map(d => d.date) || [];
    setAvailDates(dates);
    setSelectedDate(dates[0] || '');
    api.get(`/training-programmes/${selectedTP}/participants`).then(r => {
      const sel = r.data.data.filter(p => p.status === 'Selected');
      setParticipants(sel);
    });
  }, [selectedTP, programmes]);

  useEffect(() => {
    if (!selectedTP || !selectedDate) return;
    setLoading(true);
    api.get(`/training-programmes/${selectedTP}/attendance?date=${selectedDate}`)
      .then(r => {
        const map = {};
        r.data.data.forEach(a => { map[a.staff_id] = a.present; });
        setAttendance(map);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [selectedTP, selectedDate]);

  const toggle = staffId => {
    setAttendance(prev => ({ ...prev, [staffId]: !prev[staffId] }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = participants.map(p => ({
        staff_id: p.Staff?.id,
        date: selectedDate,
        present: !!attendance[p.Staff?.id],
      }));
      await api.post(`/training-programmes/${selectedTP}/attendance`, { records });
      toast.success('Attendance saved');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const exportExcel = async () => {
    try {
      const res = await api.get(`/training-programmes/${selectedTP}/attendance/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'Attendance.xlsx'; a.click();
    } catch { toast.error('Export failed'); }
  };

  const presentCount = participants.filter(p => !!attendance[p.Staff?.id]).length;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Attendance" subtitle="Mark daily attendance for training participants">
        <button className="btn btn-secondary" onClick={exportExcel}><Download size={14} /> Export Excel</button>
        <button className="btn btn-primary" onClick={saveAttendance} disabled={saving}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save Attendance'}
        </button>
      </PageHeader>

      <div className="card mb-4 p-4 flex items-end gap-4 flex-wrap">
        <FormField label="Training Programme">
          <select className="form-select w-72" value={selectedTP} onChange={e => setSelectedTP(e.target.value)}>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.Course?.name} — {p.year}</option>)}
          </select>
        </FormField>
        <FormField label="Date">
          <select className="form-select w-44" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
            {availDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FormField>
        <div className="pb-1">
          <span className="badge badge-blue">{presentCount} / {participants.length} Present</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Progress Bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Attendance Rate</span>
            <span>{participants.length ? Math.round((presentCount / participants.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${participants.length ? (presentCount / participants.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr>
              <th>#</th><th>NIC</th><th>Name</th><th>Designation</th><th>Institution</th><th>District</th>
              <th className="text-center">Present</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted">Loading…</td></tr>
              ) : participants.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-muted text-xs">{i + 1}</td>
                  <td>{p.Staff?.nic}</td>
                  <td className="font-semibold">{p.Staff?.name}</td>
                  <td>{p.Staff?.designation}</td>
                  <td>{p.Staff?.Institution?.name || '—'}</td>
                  <td>{p.Staff?.district}</td>
                  <td className="text-center">
                    <button
                      onClick={() => toggle(p.Staff?.id)}
                      className={`w-8 h-8 rounded-full border-2 font-bold text-sm transition-all ${
                        attendance[p.Staff?.id]
                          ? 'bg-success border-success text-white'
                          : 'bg-white border-border text-muted hover:border-success hover:text-success'
                      }`}
                    >
                      {attendance[p.Staff?.id] ? '✓' : '○'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
