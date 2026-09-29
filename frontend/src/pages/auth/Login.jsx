import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, ShieldCheck, UserPlus } from 'lucide-react';

const ROLE_ROUTES = {
  Admin:                       '/app/staff',
  Director:                    '/app/dashboard',
  'Training Officer':          '/app/training-programmes',
  'Course Coordinator':        '/app/training-programmes',
  'Institutional Coordinator': '/app/apply',
  Participant:                 '/app/apply',
  Special:                     '/app/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(identifier, password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(ROLE_ROUTES[user.role] || '/app/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isNicMode = identifier && !identifier.includes('@');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cpath%20d%3D%22M0%2040L40%200M0%200%22%20stroke%3D%22rgba(255%2C255%2C255%2C.04)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl relative z-10">
        {/* ── Left Panel ────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
          <div>
            <img src="/logo.svg" alt="MDTU Logo" className="w-24 h-24 mb-6 drop-shadow-lg" />
            <h1 className="text-3xl font-bold mb-3">Training Management System</h1>
            <p className="text-blue-200 text-sm leading-relaxed">
              Management Development Training Unit<br />
              Northern Province — Sri Lanka
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white/10 p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-blue-200" />
                <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Login Options</span>
              </div>
              <div className="space-y-2 text-xs text-blue-200">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">1</span>
                  <span><strong className="text-white">Provincial staff</strong> (Institutional Coordinators &amp; Participants) — use your <strong className="text-white">NIC number</strong> to log in</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">2</span>
                  <span><strong className="text-white">Admin / Officers / Directors</strong> — use your <strong className="text-white">email address</strong> to log in</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 transition-all duration-200 border border-white/20 text-white text-sm font-medium group"
            >
              <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
              New User? Register Here
            </Link>
          </div>
        </div>

        {/* ── Right Panel — Login Form ───────────────────────── */}
        <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <img src="/logo.svg" alt="MDTU Logo" className="w-12 h-12 mb-4 lg:hidden" />
            <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
            <p className="text-sm text-muted mt-1">
              {isNicMode
                ? 'Signing in with NIC number'
                : 'Enter your NIC number or email address'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">
                NIC Number / Email Address
              </label>
              <input
                id="login-identifier"
                type="text"
                className="form-input"
                placeholder="e.g. 199012345678 or your.email@tms.lk"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
              {isNicMode && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Logging in with NIC number
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPw(s => !s)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Mobile register link */}
          <div className="mt-6 lg:hidden">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <UserPlus size={15} />
              New User? Register Here
            </Link>
          </div>

          <p className="text-xs text-muted mt-8 text-center">
            © 2026 Management Development Training Unit
          </p>
        </div>
      </div>
    </div>
  );
}
