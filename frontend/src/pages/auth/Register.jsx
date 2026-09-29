import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Loader2, ShieldCheck, ShieldX, CheckCircle2,
  User, Phone, Mail, Lock, ChevronLeft, ChevronRight,
  Building2, UserCog, Search,
} from 'lucide-react';

// ── Roles split by registration path ──────────────────────────
const PROVINCIAL_ROLES = ['Institutional Coordinator', 'Participant'];
// Other-path registrants are always Participant (pending admin approval)
const OTHER_ROLE = 'Participant';

// ── Step indicator ─────────────────────────────────────────────
function StepBadge({ step, current, label }) {
  const done    = current > step;
  const active  = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
        ${done   ? 'bg-green-500 text-white'
        : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                 : 'bg-slate-100 text-slate-400'}`}>
        {done ? <CheckCircle2 size={16} /> : step}
      </div>
      <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

function StepConnector({ done }) {
  return (
    <div className={`flex-1 h-0.5 mx-1 mt-4 transition-all duration-300 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ── Registration type ──────────────────────────────────────
  const [regType, setRegType] = useState(null); // 'provincial' | 'other'
  const [step, setStep]       = useState(0);    // 0 = choose type

  // ── Provincial flow state ──────────────────────────────────
  const [nicInput, setNicInput]       = useState('');
  const [nicStatus, setNicStatus]     = useState(null); // null | 'checking' | 'ok' | 'error'
  const [nicMessage, setNicMessage]   = useState('');
  const [staffInfo, setStaffInfo]     = useState(null);
  const [provForm, setProvForm]       = useState({ mobile: '', email: '', password: '', confirmPw: '' });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole]               = useState('Institutional Coordinator');
  const [loading, setLoading]         = useState(false);

  // ── Other user flow state ──────────────────────────────────
  const [otherForm, setOtherForm] = useState({
    nic: '', name: '', mobile: '', email: '', password: '', confirmPw: '',
  });
  const [otherShowPw, setOtherShowPw]           = useState(false);
  const [otherShowConfirm, setOtherShowConfirm] = useState(false);
  const [otherLoading, setOtherLoading]         = useState(false);

  // ── NIC check (provincial) ─────────────────────────────────
  const checkNic = async () => {
    if (!nicInput.trim()) { toast.error('Please enter a NIC number'); return; }
    setNicStatus('checking');
    setStaffInfo(null);
    try {
      const { data } = await api.get(`/auth/check-nic?nic=${encodeURIComponent(nicInput.trim())}`);
      if (data.success) {
        setNicStatus('ok');
        setNicMessage(data.message);
        setStaffInfo(data.staffInfo);
      } else {
        setNicStatus('error');
        setNicMessage(data.message);
      }
    } catch (err) {
      setNicStatus('error');
      setNicMessage(err.response?.data?.message || 'Unable to verify NIC. Please try again.');
    }
  };

  const handleNicKeyDown = e => { if (e.key === 'Enter') { e.preventDefault(); checkNic(); } };

  // ── Provincial form submit ─────────────────────────────────
  const handleProvincialSubmit = async e => {
    e.preventDefault();
    if (provForm.password !== provForm.confirmPw) { toast.error('Passwords do not match'); return; }
    if (provForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        nic:      nicInput.trim(),
        name:     staffInfo?.name || nicInput.trim(),
        mobile:   provForm.mobile,
        email:    provForm.email,
        password: provForm.password,
        role,
      });
      toast.success('Registration successful! Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Other user form submit ─────────────────────────────────
  const handleOtherSubmit = async e => {
    e.preventDefault();
    if (otherForm.password !== otherForm.confirmPw) { toast.error('Passwords do not match'); return; }
    if (otherForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setOtherLoading(true);
    try {
      await register({
        nic:      otherForm.nic,
        name:     otherForm.name,
        mobile:   otherForm.mobile,
        email:    otherForm.email,
        password: otherForm.password,
        role:     OTHER_ROLE,
      });
      toast.success('Registration submitted! Please wait for administrator approval before logging in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setOtherLoading(false);
    }
  };

  // ── Helper ─────────────────────────────────────────────────
  const inputCls = (err) =>
    `form-input ${err ? 'border-red-400 ring-2 ring-red-100' : ''}`;

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cpath%20d%3D%22M0%2040L40%200M0%200%22%20stroke%3D%22rgba(255%2C255%2C255%2C.04)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />

      <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-2xl relative z-10">

        {/* ── Left branding panel ──────────────────────────── */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-10 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
          <div>
            <img src="/logo.svg" alt="MDTU Logo" className="w-20 h-20 mb-6 drop-shadow-lg" />
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Training Management System<br />
              Management Development Training Unit<br />
              Northern Province — Sri Lanka
            </p>

            {/* Registration type guide */}
            <div className="space-y-3 text-sm">
              <div className={`rounded-xl p-4 border transition-all duration-300 cursor-pointer
                ${regType === 'provincial'
                  ? 'bg-white/20 border-white/40'
                  : 'bg-white/8 border-white/15 hover:bg-white/14'}`}
                onClick={() => { setRegType('provincial'); setStep(1); }}>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={15} className="text-blue-200" />
                  <span className="font-semibold text-white">Provincial Staff</span>
                </div>
                <p className="text-blue-200 text-xs leading-relaxed">
                  Institutional Coordinators &amp; Participants.<br />
                  <strong className="text-white">NIC must exist</strong> in provincial database.
                </p>
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-300 cursor-pointer
                ${regType === 'other'
                  ? 'bg-white/20 border-white/40'
                  : 'bg-white/8 border-white/15 hover:bg-white/14'}`}
                onClick={() => { setRegType('other'); setStep(1); }}>
                <div className="flex items-center gap-2 mb-1">
                  <UserCog size={15} className="text-blue-200" />
                  <span className="font-semibold text-white">Participant (New)</span>
                </div>
                <p className="text-blue-200 text-xs leading-relaxed">
                  Register as a Participant.<br />
                  <strong className="text-white">Pending admin approval</strong> before login.
                </p>
              </div>
            </div>
          </div>

          <Link to="/login" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors mt-6">
            <ChevronLeft size={16} />
            Back to Login
          </Link>
        </div>

        {/* ── Right form panel ─────────────────────────────── */}
        <div className="bg-white lg:col-span-3 p-8 lg:p-10 flex flex-col min-h-[600px]">

          {/* Mobile back link */}
          <div className="lg:hidden mb-4">
            <Link to="/login" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <ChevronLeft size={14} /> Back to Login
            </Link>
          </div>

          {/* ── TYPE SELECTION (mobile & fallback) ─────────── */}
          {regType === null && (
            <div className="flex flex-col flex-1 justify-center gap-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
                <p className="text-sm text-muted">Choose your registration type to continue</p>
              </div>

              <div className="grid gap-4">
                <button
                  id="reg-type-provincial"
                  onClick={() => { setRegType('provincial'); setStep(1); }}
                  className="flex items-start gap-4 p-5 rounded-xl border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0 transition-colors">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Provincial Staff</p>
                    <p className="text-xs text-muted mt-0.5">Institutional Coordinators &amp; Participants — NIC verified against provincial database</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 ml-auto mt-1 transition-colors" />
                </button>

                <button
                  id="reg-type-other"
                  onClick={() => { setRegType('other'); setStep(1); }}
                  className="flex items-start gap-4 p-5 rounded-xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
                    <UserCog size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Participant (New Registration)</p>
                    <p className="text-xs text-muted mt-0.5">Register as a Participant — account requires administrator approval before you can log in</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 ml-auto mt-1 transition-colors" />
                </button>
              </div>

              <p className="text-center text-sm text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              PROVINCIAL FLOW
          ══════════════════════════════════════════════════ */}
          {regType === 'provincial' && (
            <div className="flex flex-col flex-1">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => { setRegType(null); setStep(0); setNicStatus(null); setStaffInfo(null); setNicInput(''); }}
                    className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800">Provincial Staff Registration</h2>
                </div>
                <p className="text-xs text-muted ml-7">Your NIC must be registered in the provincial staff database</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center mb-7 px-2">
                <StepBadge step={1} current={step} label="Verify NIC" />
                <StepConnector done={step > 1} />
                <StepBadge step={2} current={step} label="Your Details" />
                <StepConnector done={step > 2} />
                <StepBadge step={3} current={step} label="Complete" />
              </div>

              {/* ── STEP 1: NIC Verification ──────────────── */}
              {step === 1 && (
                <div className="flex flex-col gap-5 flex-1">
                  <div>
                    <label className="form-label">NIC Number</label>
                    <div className="flex gap-2">
                      <input
                        id="prov-nic-input"
                        type="text"
                        className={`form-input flex-1 font-mono ${
                          nicStatus === 'ok' ? 'border-green-400 ring-2 ring-green-100'
                          : nicStatus === 'error' ? 'border-red-400 ring-2 ring-red-100'
                          : ''
                        }`}
                        placeholder="e.g. 199012345678 or 901234567V"
                        value={nicInput}
                        onChange={e => { setNicInput(e.target.value); setNicStatus(null); setStaffInfo(null); }}
                        onKeyDown={handleNicKeyDown}
                        disabled={nicStatus === 'checking'}
                      />
                      <button
                        id="prov-nic-check"
                        type="button"
                        onClick={checkNic}
                        disabled={nicStatus === 'checking' || !nicInput.trim()}
                        className="btn btn-primary px-4 flex items-center gap-2 shrink-0"
                      >
                        {nicStatus === 'checking'
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Search size={15} />}
                        {nicStatus === 'checking' ? 'Checking…' : 'Verify'}
                      </button>
                    </div>

                    {/* Status message */}
                    {nicStatus === 'ok' && (
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                        <ShieldCheck size={16} className="text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">{nicMessage}</p>
                          {staffInfo && (
                            <div className="mt-1 text-xs text-green-700 space-y-0.5">
                              {staffInfo.name        && <p>Name: <strong>{staffInfo.name}</strong></p>}
                              {staffInfo.designation && <p>Designation: <strong>{staffInfo.designation}</strong></p>}
                              {staffInfo.district    && <p>District: <strong>{staffInfo.district}</strong></p>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {nicStatus === 'error' && (
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                        <ShieldX size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{nicMessage}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Your Role</label>
                    <select
                      id="prov-role-select"
                      className="form-select"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                    >
                      {PROVINCIAL_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-auto">
                    <button
                      id="prov-step1-next"
                      type="button"
                      disabled={nicStatus !== 'ok'}
                      onClick={() => setStep(2)}
                      className="btn btn-primary w-full justify-center py-2.5"
                    >
                      Continue
                      <ChevronRight size={16} />
                    </button>
                    {nicStatus !== 'ok' && (
                      <p className="text-center text-xs text-muted mt-2">Verify your NIC to continue</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Contact & Password ─────────────── */}
              {step === 2 && (
                <form onSubmit={handleProvincialSubmit} className="flex flex-col gap-4 flex-1">

                  {/* Name (read-only from staff) */}
                  {staffInfo?.name && (
                    <div>
                      <label className="form-label flex items-center gap-1.5">
                        <User size={12} /> Full Name <span className="text-green-600 font-normal">(from provincial database)</span>
                      </label>
                      <input type="text" className="form-input bg-slate-50 text-slate-500" value={staffInfo.name} disabled />
                    </div>
                  )}

                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Phone size={12} /> Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="prov-mobile"
                      type="tel"
                      className="form-input"
                      placeholder="07X XXX XXXX"
                      value={provForm.mobile}
                      onChange={e => setProvForm(f => ({ ...f, mobile: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Mail size={12} /> Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="prov-email"
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={provForm.email}
                      onChange={e => setProvForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Lock size={12} /> Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="prov-password"
                        type={showPw ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder="Minimum 6 characters"
                        value={provForm.password}
                        onChange={e => setProvForm(f => ({ ...f, password: e.target.value }))}
                        required minLength={6}
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPw(s => !s)}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Lock size={12} /> Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="prov-confirm-pw"
                        type={showConfirm ? 'text' : 'password'}
                        className={`form-input pr-10 ${
                          provForm.confirmPw && provForm.confirmPw !== provForm.password
                            ? 'border-red-400 ring-2 ring-red-100' : ''
                        }`}
                        placeholder="Re-enter your password"
                        value={provForm.confirmPw}
                        onChange={e => setProvForm(f => ({ ...f, confirmPw: e.target.value }))}
                        required
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowConfirm(s => !s)}>
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {provForm.confirmPw && provForm.confirmPw !== provForm.password && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto pt-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="btn px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button
                      id="prov-register-btn"
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex-1 justify-center py-2.5"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      {loading ? 'Registering…' : 'Create Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              OTHER USER FLOW
          ══════════════════════════════════════════════════ */}
          {regType === 'other' && (
            <div className="flex flex-col flex-1">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => { setRegType(null); setStep(0); }}
                    className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800">Participant Registration</h2>
                </div>
                <p className="text-xs text-muted ml-7">Register as a new Participant — admin approval required before login</p>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <ShieldCheck size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Pending Approval:</strong> Your account will be reviewed and activated by an Administrator before you can log in. Please use your official credentials.
                </p>
              </div>

              <form onSubmit={handleOtherSubmit} className="flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <User size={12} /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="other-name"
                      type="text"
                      className="form-input"
                      placeholder="Your full name"
                      value={otherForm.name}
                      onChange={e => setOtherForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      NIC Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="other-nic"
                      type="text"
                      className="form-input font-mono"
                      placeholder="199012345678"
                      value={otherForm.nic}
                      onChange={e => setOtherForm(f => ({ ...f, nic: e.target.value }))}
                      required
                    />
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Phone size={12} /> Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="other-mobile"
                      type="tel"
                      className="form-input"
                      placeholder="07X XXX XXXX"
                      value={otherForm.mobile}
                      onChange={e => setOtherForm(f => ({ ...f, mobile: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Mail size={12} /> Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="other-email"
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={otherForm.email}
                      onChange={e => setOtherForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Lock size={12} /> Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="other-password"
                        type={otherShowPw ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder="Min 6 characters"
                        value={otherForm.password}
                        onChange={e => setOtherForm(f => ({ ...f, password: e.target.value }))}
                        required minLength={6}
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setOtherShowPw(s => !s)}>
                        {otherShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Lock size={12} /> Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="other-confirm-pw"
                        type={otherShowConfirm ? 'text' : 'password'}
                        className={`form-input pr-10 ${
                          otherForm.confirmPw && otherForm.confirmPw !== otherForm.password
                            ? 'border-red-400 ring-2 ring-red-100' : ''
                        }`}
                        placeholder="Re-enter password"
                        value={otherForm.confirmPw}
                        onChange={e => setOtherForm(f => ({ ...f, confirmPw: e.target.value }))}
                        required
                      />
                      <button type="button" tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setOtherShowConfirm(s => !s)}>
                        {otherShowConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {otherForm.confirmPw && otherForm.confirmPw !== otherForm.password && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    id="other-register-btn"
                    type="submit"
                    disabled={otherLoading}
                    className="btn btn-primary w-full justify-center py-2.5"
                  >
                    {otherLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {otherLoading ? 'Registering…' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Already have account */}
          {regType !== null && (
            <p className="text-center text-xs text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
