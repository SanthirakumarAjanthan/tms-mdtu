import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PageHeader } from '../../components/UI';
import { BarChart3 } from 'lucide-react';

export default function FeedbackSummary() {
  const [programmes, setProgrammes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/training-programmes?limit=200').then(r => setProgrammes(r.data.data));
  }, []);

  const loadFeedback = async id => {
    setSelected(id);
    setLoading(true);
    try {
      const r = await api.get(`/participant/feedback/${id}`);
      setFeedbacks(r.data.data);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Feedback Summary" subtitle="View aggregated participant feedback per programme" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card divide-y divide-border">
          {programmes.map(p => (
            <button key={p.id} className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-2 transition-colors ${selected === p.id ? 'bg-primary-dim text-primary font-semibold' : 'text-slate-600'}`} onClick={() => loadFeedback(p.id)}>
              {p.Course?.name} — {p.year}
            </button>
          ))}
        </div>
        <div className="col-span-2 card p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted">Loading…</div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted">
              <BarChart3 size={40} strokeWidth={1.2} />
              <p>{selected ? 'No feedback submitted yet for this programme.' : 'Select a programme to view feedback.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">{feedbacks.length} Response(s)</h3>
              {feedbacks.map((fb, _i) => (
                <div key={fb.id} className="border border-border rounded-lg p-4">
                  <div className="text-sm font-semibold mb-1">{fb.Staff?.name}</div>
                  <div className="text-xs text-muted mb-2">{fb.Staff?.nic}</div>
                  {fb.ratings && typeof fb.ratings === 'object' && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {Object.entries(fb.ratings).map(([k, v]) => (
                        <div key={k} className="text-xs"><span className="text-muted capitalize">{k.replace(/_/g, ' ')}: </span><span className="font-semibold">{v}/5 ⭐</span></div>
                      ))}
                    </div>
                  )}
                  {fb.comments && <div className="text-xs text-slate-600 border-t border-border pt-2 mt-2">"{fb.comments}"</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
