import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../auth/useAuth';
import { Users, BookOpen, CalendarDays, UserCheck, Building2, BarChart3, TrendingUp, ArrowRight, Activity } from 'lucide-react';

/* ── Mini stat card ─────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, to }) {
  const navigate = useNavigate();
  const colors = {
    blue:   { bg: 'bg-blue-50',    icon: 'bg-blue-600',    text: 'text-blue-600',    border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100' },
    yellow: { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-600',   border: 'border-amber-100' },
    purple: { bg: 'bg-violet-50',  icon: 'bg-violet-600',  text: 'text-violet-600',  border: 'border-violet-100' },
    red:    { bg: 'bg-rose-50',    icon: 'bg-rose-600',    text: 'text-rose-600',    border: 'border-rose-100' },
    cyan:   { bg: 'bg-cyan-50',    icon: 'bg-cyan-600',    text: 'text-cyan-600',    border: 'border-cyan-100' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div
      onClick={() => to && navigate(to)}
      className={`bg-white rounded-xl border ${c.border} p-5 flex items-center gap-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 animate-fade-up ${to ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-black ${c.text}`}>{value ?? '—'}</div>
        <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">{label}</div>
      </div>
    </div>
  );
}

/* ── Status badge ───────────────────────────────────────────── */
function ProgrammeBadge({ status }) {
  const map = {
    Draft: 'badge-gray', Published: 'badge-blue', Ongoing: 'badge-yellow',
    Completed: 'badge-green', Cancelled: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

/* ── Mini bar chart ─────────────────────────────────────────── */
function MiniBarChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t-md bg-blue-500/80 group-hover:bg-blue-600 transition-all duration-300"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only true Admin gets admin-level stat cards & API calls
  const isAdmin        = user?.role === 'Admin';
  const canViewProgs   = ['Admin', 'Director', 'Training Officer', 'Course Coordinator'].includes(user?.role);
  const isParticipant  = ['Participant', 'Institutional Coordinator'].includes(user?.role);

  const [stats, setStats]             = useState({ staff: 0, courses: 0, programmes: 0, institutions: 0, resourcePersons: 0 });
  const [myApps, setMyApps]           = useState(0);
  const [recentProgs, setRecentProgs] = useState([]);
  const [chartData, setChartData]     = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const promises = [];

        if (isAdmin) {
          // Admin: fetch everything
          promises.push(
            api.get('/training-programmes?limit=6&page=1'),
            api.get('/staff?limit=1'),
            api.get('/courses?limit=1'),
            api.get('/institutions?limit=1'),
            api.get('/resource-persons?limit=1'),
          );
          const [tpRes, staffRes, courseRes, instRes, rpRes] = await Promise.all(promises);
          const programmes = tpRes.data.data || [];
          setRecentProgs(programmes.slice(0, 5));
          buildChart(programmes);
          setStats({
            staff:           staffRes.data.total,
            courses:         courseRes.data.total,
            programmes:      tpRes.data.total,
            institutions:    instRes.data.total,
            resourcePersons: rpRes.data.total,
          });

        } else if (canViewProgs) {
          // Director / Training Officer / Course Coordinator: only training programmes
          const tpRes = await api.get('/training-programmes?limit=6&page=1');
          const programmes = tpRes.data.data || [];
          setRecentProgs(programmes.slice(0, 5));
          buildChart(programmes);
          setStats(s => ({ ...s, programmes: tpRes.data.total }));

        } else if (isParticipant) {
          // Participant / Institutional Coordinator: their own applications
          const appsRes = await api.get(`/participant/my-applications?staff_id=${user?.id}`).catch(() => ({ data: { data: [] } }));
          setMyApps(appsRes.data.data?.length || 0);
        }

      } catch { /* silent — individual failures handled above */ }
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?.id]);

  function buildChart(programmes) {
    const counts = {};
    programmes.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    setChartData(Object.entries(counts).map(([label, value]) => ({ label, value })));
  }

  /* ── Role-specific stat cards ── */
  const statsByRole = {
    Admin: [
      { label: 'Total Staff',         value: stats.staff,           icon: Users,        color: 'blue',   to: '/app/staff' },
      { label: 'Courses',             value: stats.courses,          icon: BookOpen,     color: 'green',  to: '/app/courses' },
      { label: 'Training Programmes', value: stats.programmes,       icon: CalendarDays, color: 'yellow', to: '/app/training-programmes' },
      { label: 'Institutions',        value: stats.institutions,     icon: Building2,    color: 'purple', to: '/app/institutions' },
      { label: 'Resource Persons',    value: stats.resourcePersons,  icon: UserCheck,    color: 'cyan',   to: '/app/resource-persons' },
    ],
    Director: [
      { label: 'Training Programmes', value: stats.programmes, icon: CalendarDays, color: 'yellow', to: '/app/training-programmes' },
    ],
    'Training Officer': [
      { label: 'Training Programmes', value: stats.programmes, icon: CalendarDays, color: 'yellow', to: '/app/training-programmes' },
    ],
    'Course Coordinator': [
      { label: 'Training Programmes', value: stats.programmes, icon: CalendarDays, color: 'yellow', to: '/app/training-programmes' },
    ],
    Participant: [
      { label: 'My Applications', value: myApps, icon: CalendarDays, color: 'blue', to: '/app/my-applications' },
    ],
    'Institutional Coordinator': [
      { label: 'My Applications', value: myApps, icon: CalendarDays, color: 'blue', to: '/app/my-applications' },
    ],
    Special: [],
  };

  const displayStats = statsByRole[user?.role] || [];

  /* ── Role-specific quick links ── */
  const quickLinks = {
    Admin: [
      { label: 'Staff Details',        icon: Users,        color: 'blue',   href: '/app/staff' },
      { label: 'Courses',              icon: BookOpen,     color: 'green',  href: '/app/courses' },
      { label: 'Training Programmes',  icon: CalendarDays, color: 'yellow', href: '/app/training-programmes' },
      { label: 'Institutions',         icon: Building2,    color: 'purple', href: '/app/institutions' },
      { label: 'Resource Persons',     icon: UserCheck,    color: 'cyan',   href: '/app/resource-persons' },
      { label: 'Reports',              icon: BarChart3,    color: 'red',    href: '/app/feedback-summary' },
    ],
    Director: [
      { label: 'Training Programmes',  icon: CalendarDays, color: 'yellow', href: '/app/training-programmes' },
      { label: 'Reports',              icon: BarChart3,    color: 'red',    href: '/app/feedback-summary' },
    ],
    'Training Officer': [
      { label: 'Training Programmes',  icon: CalendarDays, color: 'yellow', href: '/app/training-programmes' },
      { label: 'Participant Selection',icon: Users,        color: 'blue',   href: '/app/participant-selection' },
      { label: 'Attendance',           icon: Activity,     color: 'green',  href: '/app/attendance' },
      { label: 'Reports',              icon: BarChart3,    color: 'red',    href: '/app/feedback-summary' },
    ],
    'Course Coordinator': [
      { label: 'Training Programmes',  icon: CalendarDays, color: 'yellow', href: '/app/training-programmes' },
      { label: 'Participant Selection',icon: Users,        color: 'blue',   href: '/app/participant-selection' },
      { label: 'Attendance',           icon: Activity,     color: 'green',  href: '/app/attendance' },
      { label: 'Reports',              icon: BarChart3,    color: 'red',    href: '/app/feedback-summary' },
    ],
    Participant: [
      { label: 'Apply for Training',   icon: BookOpen,     color: 'blue',   href: '/app/apply' },
      { label: 'My Applications',      icon: CalendarDays, color: 'green',  href: '/app/my-applications' },
      { label: 'Feedback',             icon: BarChart3,    color: 'purple', href: '/app/my-feedback' },
    ],
    'Institutional Coordinator': [
      { label: 'Apply Training',       icon: BookOpen,     color: 'blue',   href: '/app/apply' },
      { label: 'My Applications',      icon: CalendarDays, color: 'green',  href: '/app/my-applications' },
    ],
    Special: [],
  };
  const links = quickLinks[user?.role] || [];

  const statusColor = {
    Draft: 'text-slate-400', Published: 'text-blue-600',
    Ongoing: 'text-amber-600', Completed: 'text-emerald-600', Cancelled: 'text-red-500',
  };

  const colCount = displayStats.length <= 2 ? 2 : displayStats.length <= 3 ? 3 : displayStats.length === 4 ? 4 : 5;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 p-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10"
          style={{ background: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
            Management Development Training Unit · Northern Province
          </p>
          <h1 className="text-2xl font-black mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-blue-200 text-sm">
            Signed in as <span className="font-semibold text-white">{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Stats grid */}
      {displayStats.length > 0 && (
        <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(colCount, 3)} lg:grid-cols-${colCount} gap-4`}>
          {displayStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Programmes — shown to roles that can view programmes */}
        {canViewProgs && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Recent Training Programmes</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Last 5 programmes in the system</p>
              </div>
              <button
                onClick={() => navigate('/app/training-programmes')}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
            ) : recentProgs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No programmes yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentProgs.map(p => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[p.status] || 'text-slate-400'} bg-current`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {p.Course?.name || `Programme #${p.id}`}
                      </div>
                      <div className="text-[11px] text-slate-400">Year {p.year || '—'}</div>
                    </div>
                    <ProgrammeBadge status={
                      p.status === 'Published' ? 'Published' :
                      p.status === 'Ongoing'   ? 'Ongoing'   :
                      p.status === 'Completed' ? 'Completed' :
                      p.status === 'Cancelled' ? 'Cancelled' :
                      p.status === 'Draft'     ? 'Draft'     : String(p.status)
                    } />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Participant: show my applications panel instead */}
        {isParticipant && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-800">My Applications</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Your training applications</p>
              </div>
              <button
                onClick={() => navigate('/app/my-applications')}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>
            <div className="py-12 text-center text-slate-400 text-sm">
              {myApps > 0 ? `You have ${myApps} application(s).` : 'No applications yet. Apply for a training programme!'}
            </div>
          </div>
        )}

        {/* Right column */}
        <div className="space-y-5">
          {/* Chart — only for roles with programme data */}
          {canViewProgs && chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Programme Status Breakdown</h3>
              </div>
              <MiniBarChart data={chartData} />
            </div>
          )}

          {/* Quick links */}
          {links.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Access</h3>
              <div className="grid grid-cols-2 gap-2">
                {links.map(q => {
                  const Icon = q.icon;
                  const clr = {
                    blue:   'bg-blue-50 text-blue-700',
                    green:  'bg-emerald-50 text-emerald-700',
                    yellow: 'bg-amber-50 text-amber-700',
                    purple: 'bg-violet-50 text-violet-700',
                    red:    'bg-rose-50 text-rose-700',
                    cyan:   'bg-cyan-50 text-cyan-700',
                  }[q.color] || 'bg-slate-50 text-slate-700';
                  return (
                    <button
                      key={q.label}
                      onClick={() => navigate(q.href)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg ${clr} hover:opacity-80 transition-all text-center text-[11px] font-semibold`}
                    >
                      <Icon size={18} />
                      {q.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
