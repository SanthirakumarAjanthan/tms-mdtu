/** Page header with title + subtitle + optional actions */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex gap-2 flex-wrap items-center">{children}</div>}
    </div>
  );
}

/** Form field wrapper — supports required asterisk, error message, and hint */
export function FormField({ label, children, required, hint, error }) {
  return (
    <div className="flex flex-col gap-0">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Active / Inactive badge */
export function ActiveBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active
      </span>
    : <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Inactive
      </span>;
}

/** Status badge for training programme status */
export function StatusBadge({ status }) {
  const map = {
    Draft:          'bg-slate-100 text-slate-600 border-slate-200',
    Published:      'bg-blue-50 text-blue-700 border-blue-200',
    Completed:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled:      'bg-red-50 text-red-700 border-red-200',
    Ongoing:        'bg-amber-50 text-amber-700 border-amber-200',
    Selected:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Not Selected': 'bg-red-50 text-red-700 border-red-200',
    Pending:        'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}

/** Legacy stat card */
export function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-violet-50 text-violet-600',
    gray:   'bg-slate-100 text-slate-500',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
