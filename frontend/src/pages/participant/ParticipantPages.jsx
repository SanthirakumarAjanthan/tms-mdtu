import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import useAuth from '../../auth/useAuth';
import DataTable from '../../components/DataTable';
import { PageHeader, FormField, StatusBadge } from '../../components/UI';
import { CheckCircle2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Apply for Training ─────────────────────────────────── */
export function ApplyTraining() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [yearFilter, setYearFilter]       = useState(String(currentYear));
  const [semesterFilter, setSemesterFilter] = useState('');

  // Generate year options: current year ± 2
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const loadProgrammes = useCallback((year, semester) => {
    setLoading(true);
    const params = new URLSearchParams({ year: year || currentYear });
    if (semester) params.set('semester', semester);
    api.get(`/participant/available-programmes?${params}`)
      .then(r => { setProgrammes(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentYear]);

  useEffect(() => { loadProgrammes(yearFilter, semesterFilter); }, [yearFilter, semesterFilter, loadProgrammes]);

  const apply = async tpId => {
    setApplying(tpId);
    try {
      await api.post('/participant/apply', { staff_id: user?.id, training_programme_id: tpId });
      toast.success('Application submitted!');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to apply'); }
    setApplying(null);
  };

  const columns = [
    { key: 'Course', label: 'Course', render: (_, r) => <span className="font-semibold">{r.Course?.name}</span> },
    { key: 'category', label: 'Category', render: (_, r) => <span className="badge badge-blue">{r.Course?.category}</span> },
    { key: 'dates',  label: 'Programme Date(s)', render: (_, r) => r.dates?.map(d => d.date).join(', ') || '—' },
    { key: 'duration', label: 'No. of Days', render: (_, r) => r.Course?.duration },
    { key: 'mode',   label: 'Mode', render: v => <span className="badge badge-gray">{v}</span> },
    { key: 'id', label: 'Action', render: (_, r) => (
      <button className="btn btn-sm btn-primary" onClick={() => apply(r.id)} disabled={applying === r.id}>
        {applying === r.id ? '…' : 'Apply'}
      </button>
    )},
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Apply for Training"
        subtitle={`Published programmes — ${yearFilter} ${semesterFilter === '1' ? '(Semester 1: Jan–Jun)' : semesterFilter === '2' ? '(Semester 2: Jul–Dec)' : '(All Semesters)'}`}
      />

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Year</label>
          <select
            className="form-select text-sm w-28"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Semester</label>
          <select
            className="form-select text-sm w-44"
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1 (Jan – Jun)</option>
            <option value="2">Semester 2 (Jul – Dec)</option>
          </select>
        </div>
        <span className="text-xs text-slate-400 ml-auto">{programmes.length} published programmes</span>
      </div>

      <DataTable columns={columns} data={programmes} loading={loading} />
    </div>
  );
}


/* ─── My Applications / Confirm ─────────────────────────── */
export function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get(`/participant/my-applications?staff_id=${user?.id}`).then(r => {
      setApps(r.data.data); setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, [user]);

  const confirm = async selId => {
    try { await api.put(`/participant/confirm/${selId}`); toast.success('Confirmed!'); load(); }
    catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'Programme', label: 'Programme', render: (_, r) => <span className="font-semibold">{r.TrainingProgramme?.Course?.name}</span> },
    { key: 'dates', label: 'Date(s)', render: (_, r) => r.TrainingProgramme?.dates?.map(d => d.date).join(', ') || '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'confirm', label: 'Confirm', render: (_, r) => r.status === 'Selected' && r.ProgrammeSelection && !r.ProgrammeSelection.confirmed
      ? <button className="btn btn-sm btn-success" onClick={() => confirm(r.ProgrammeSelection.id)}><CheckCircle2 size={13} /> Confirm</button>
      : r.ProgrammeSelection?.confirmed ? <span className="badge badge-green">Confirmed ✓</span> : '—'
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader title="My Applications" subtitle="View your training application status and confirm attendance" />
      <DataTable columns={columns} data={apps} loading={loading} />
    </div>
  );
}

/* ─── Feedback Form ────────────────────────────────────────── */
const FEEDBACK_QUESTIONS = [
  { key: 'content_relevance',  label: 'Content Relevance',   label_ta: 'உள்ளடக்க தொடர்பு' },
  { key: 'facilitator_skills', label: 'Facilitator Skills',  label_ta: 'வழிகாட்டி திறன்கள்' },
  { key: 'venue_facilities',   label: 'Venue & Facilities',  label_ta: 'இடம் & வசதிகள்' },
  { key: 'time_management',    label: 'Time Management',     label_ta: 'நேர மேலாண்மை' },
  { key: 'overall_quality',    label: 'Overall Quality',     label_ta: 'ஒட்டுமொத்த தரம்' },
];

export function FeedbackForm() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [selectedTP, setSelectedTP] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState('');
  const [lang, setLang] = useState('en');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get(`/participant/my-applications?staff_id=${user?.id}`).then(r => {
      const completed = r.data.data.filter(a => a.status === 'Selected' && a.TrainingProgramme?.status === 'Completed');
      setApps(completed);
    });
  }, [user]);

  const rate = (key, val) => setRatings(prev => ({ ...prev, [key]: val }));

  const submit = async () => {
    if (Object.keys(ratings).length < FEEDBACK_QUESTIONS.length) return toast.error('Please rate all questions');
    setSubmitting(true);
    try {
      await api.post('/participant/feedback', { staff_id: user?.id, training_programme_id: selectedTP, ratings, comments });
      toast.success('Feedback submitted! Thank you.'); setSubmitted(true);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title={lang === 'en' ? 'Training Feedback' : 'பயிற்சி மதிப்பீட்டுப் படிவம்'} subtitle={lang === 'en' ? 'Training Evaluation Form' : 'Training Feedback Form'} />
        <button className="btn btn-ghost btn-sm" onClick={() => setLang(l => l === 'en' ? 'ta' : 'en')}>
          {lang === 'en' ? 'த (Tamil)' : '🇬🇧 English'}
        </button>
      </div>

      {submitted ? (
        <div className="card p-10 text-center">
          <CheckCircle2 size={48} className="text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
          <p className="text-muted text-sm mt-1">உங்கள் கருத்துக்கு நன்றி!</p>
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <FormField label={lang === 'en' ? 'Select Programme' : 'திட்டத்தை தேர்வு செய்க'}>
            <select className="form-select" value={selectedTP || ''} onChange={e => setSelectedTP(Number(e.target.value))}>
              <option value="">— {lang === 'en' ? 'Select' : 'தேர்வு'} —</option>
              {apps.map(a => <option key={a.TrainingProgramme?.id} value={a.TrainingProgramme?.id}>{a.TrainingProgramme?.Course?.name}</option>)}
            </select>
            {apps.length === 0 && <p className="text-xs text-muted mt-1">{lang === 'en' ? 'No eligible programmes for feedback.' : 'மதிப்பீட்டிற்கு தகுதியான திட்டங்கள் இல்லை.'}</p>}
          </FormField>

          {selectedTP && FEEDBACK_QUESTIONS.map(q => (
            <div key={q.key}>
              <p className="text-sm font-medium text-slate-700 mb-2">
                {lang === 'en' ? q.label : q.label_ta}
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => rate(q.key, v)}
                    className={`w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all ${
                      ratings[q.key] === v ? 'bg-primary text-white border-primary' : 'border-border text-slate-500 hover:border-primary hover:text-primary'
                    }`}>{v}</button>
                ))}
                <span className="text-xs text-muted self-center ml-2">
                  {ratings[q.key] ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratings[q.key]] : ''}
                </span>
              </div>
            </div>
          ))}

          {selectedTP && (
            <>
              <FormField label={lang === 'en' ? 'Additional Comments' : 'கூடுதல் கருத்துக்கள்'}>
                <textarea className="form-input" rows={3} value={comments} onChange={e => setComments(e.target.value)} />
              </FormField>
              <button className="btn btn-primary w-full justify-center" onClick={submit} disabled={submitting}>
                <Star size={14} /> {submitting ? 'Submitting…' : (lang === 'en' ? 'Submit Feedback' : 'மதிப்பீட்டை சமர்ப்பிக்கவும்')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
