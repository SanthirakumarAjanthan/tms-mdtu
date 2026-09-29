import { useState } from 'react';
import useAuth from '../../auth/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Hash, Shield, Key, Save, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { FormField } from '../../components/UI';

const ROLE_COLORS = {
  Admin: 'from-red-500 to-rose-600',
  Director: 'from-violet-500 to-purple-600',
  'Training Officer': 'from-orange-500 to-amber-600',
  'Course Coordinator': 'from-blue-500 to-blue-700',
  'Institutional Coordinator': 'from-teal-500 to-cyan-600',
  Participant: 'from-emerald-500 to-green-600',
  Special: 'from-slate-500 to-slate-700',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  /* ── Profile form ────────────────────────────────────────── */
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', nic: user?.nic || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    if (!profile.email.trim()) { toast.error('Email is required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  /* ── Password form ───────────────────────────────────────── */
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pw.newPassword !== pw.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await api.post('/auth/change-password', { oldPassword: pw.oldPassword, newPassword: pw.newPassword });
      toast.success('Password changed successfully');
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setSavingPw(false);
  };

  const gradClass = ROLE_COLORS[user?.role] || 'from-blue-500 to-blue-700';

  const PwToggle = ({ field }) => (
    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}>
      {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="animate-fade-up max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className={`rounded-2xl bg-gradient-to-br ${gradClass} p-6 text-white shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-12 translate-x-12"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shadow-inner border border-white/30">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">My Profile</div>
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <div className="flex items-center gap-2 mt-1 opacity-90">
              <Shield size={13} />
              <span className="text-sm font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile details card */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
            <User size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Personal Information</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <FormField label="Full Name" required>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="form-input pl-9"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>
            </FormField>

            <FormField label="Email Address" required>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className="form-input pl-9"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </FormField>

            <FormField label="NIC / ID Number">
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="form-input pl-9"
                  value={profile.nic}
                  onChange={e => setProfile(p => ({ ...p, nic: e.target.value }))}
                  placeholder="NIC or staff ID"
                />
              </div>
            </FormField>

            {/* Read-only role */}
            <div className="flex flex-col gap-1">
              <label className="form-label">Role</label>
              <div className="form-input bg-surface-2 text-slate-500 flex items-center gap-2 cursor-not-allowed">
                <Shield size={14} className="text-slate-400" />
                {user?.role}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary w-full justify-center mt-2"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
            <Key size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800">Change Password</h2>
          </div>

          {pwSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success-dim border border-success/20 text-success text-sm mb-4 animate-fade-in">
              <CheckCircle2 size={16} /> Password changed successfully!
            </div>
          )}

          <form onSubmit={handleChangePw} className="space-y-4">
            <FormField label="Current Password" required>
              <div className="relative">
                <input
                  type={showPw.old ? 'text' : 'password'}
                  className="form-input pr-10"
                  value={pw.oldPassword}
                  onChange={e => setPw(p => ({ ...p, oldPassword: e.target.value }))}
                  placeholder="Current password"
                  required
                />
                <PwToggle field="old" />
              </div>
            </FormField>

            <FormField label="New Password" required>
              <div className="relative">
                <input
                  type={showPw.new ? 'text' : 'password'}
                  className="form-input pr-10"
                  value={pw.newPassword}
                  onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
                <PwToggle field="new" />
              </div>
              {pw.newPassword.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[3, 6, 9, 12].map((n, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pw.newPassword.length >= n ? (n < 6 ? 'bg-danger' : n < 9 ? 'bg-warning' : 'bg-success') : 'bg-slate-200'}`} />
                  ))}
                </div>
              )}
            </FormField>

            <FormField label="Confirm New Password" required>
              <div className="relative">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  className="form-input pr-10"
                  value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                />
                <PwToggle field="confirm" />
              </div>
              {pw.confirm && pw.newPassword !== pw.confirm && (
                <p className="text-[11px] text-danger mt-1">Passwords do not match</p>
              )}
            </FormField>

            <button
              type="submit"
              disabled={savingPw || (pw.confirm && pw.newPassword !== pw.confirm)}
              className="btn btn-primary w-full justify-center mt-2"
            >
              {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-5 flex items-start gap-3">
        <Shield size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-500 leading-relaxed">
          Your <span className="font-semibold text-slate-700">name</span>, <span className="font-semibold text-slate-700">email</span>, and <span className="font-semibold text-slate-700">NIC</span> are used for system login and official correspondence.
          Contact your system administrator if you need to change your role or institution.
        </div>
      </div>
    </div>
  );
}
