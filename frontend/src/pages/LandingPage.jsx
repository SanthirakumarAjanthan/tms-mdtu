import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  BookOpen, Users, ClipboardList, BarChart3, Award, Shield,
  ChevronRight, ArrowRight, CheckCircle2, Globe, Calendar,
  GraduationCap, Briefcase, FileText, Mail, Phone, MapPin,
  Star, TrendingUp, Clock, Menu, X
} from 'lucide-react';

/* ── Animated counter hook ──────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Intersection observer hook ─────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({ value, suffix = '', label, icon: Icon, color, inView }) {
  const count = useCountUp(value, 2000, inView);
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6 ${color}`} />
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${color} bg-opacity-20`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="text-4xl font-black text-white mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-blue-200 font-medium">{label}</div>
    </div>
  );
}

/* ── Feature Card ───────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, color, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
      className={`group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${inView ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Timeline Step ──────────────────────────────────────── */
function TimelineStep({ step, title, description, icon: Icon, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-200">
          <Icon size={18} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-blue-400 to-transparent mt-2" />}
      </div>
      <div className="pb-8">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Step {step}</span>
        <h4 className="text-base font-bold text-slate-800 mt-0.5 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsRef, statsInView] = useInView(0.3);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const stats = [
    { value: 500, suffix: '+', label: 'Training Programmes', icon: BookOpen, color: 'bg-blue-500' },
    { value: 12000, suffix: '+', label: 'Participants Trained', icon: Users, color: 'bg-emerald-500' },
    { value: 120, suffix: '+', label: 'Certified Instructors', icon: GraduationCap, color: 'bg-violet-500' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: Star, color: 'bg-amber-500' },
  ];

  const features = [
    {
      icon: BookOpen, color: 'bg-blue-600',
      title: 'Training Programme Management',
      description: 'Plan, schedule, and manage training programmes with ease — from inception to completion, all in one centralised hub.',
    },
    {
      icon: Users, color: 'bg-emerald-600',
      title: 'Participant Management',
      description: 'Streamline participant registration, selection, and tracking across institutions in the Northern Province.',
    },
    {
      icon: ClipboardList, color: 'bg-violet-600',
      title: 'Attendance & Feedback',
      description: 'Record daily attendance digitally and collect structured feedback to continuously improve training quality.',
    },
    {
      icon: Award, color: 'bg-amber-500',
      title: 'Resource Person Registry',
      description: 'Maintain a verified pool of qualified resource persons with credentials, availability, and payment tracking.',
    },
    {
      icon: BarChart3, color: 'bg-rose-600',
      title: 'Analytics & Reports',
      description: 'Generate insightful reports on participation trends, completion rates, and programme effectiveness at a glance.',
    },
    {
      icon: Mail, color: 'bg-cyan-600',
      title: 'Approval & Notifications',
      description: 'Automate approval workflows and email notifications, ensuring all stakeholders are kept informed in real time.',
    },
  ];

  const steps = [
    { icon: Shield, title: 'Secure Login', description: 'Staff, coordinators, and participants each have role-specific secure access to the system.' },
    { icon: Calendar, title: 'Schedule Training', description: 'Training Officers create and publish programmes with venue, dates, and resource assignments.' },
    { icon: Users, title: 'Participant Selection', description: 'Coordinators nominate and approve participants; institutions receive automated email notifications.' },
    { icon: CheckCircle2, title: 'Delivery & Feedback', description: 'Attendance is tracked daily. Participants submit post-training feedback digitally.', isLast: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">

      {/* ── NAV BAR ──────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="MDTU Logo" className="w-9 h-9 object-contain drop-shadow-md" />
              <div className="leading-tight">
                <div className="text-white font-bold text-sm tracking-tight">TMS — MDTU</div>
                <div className="text-blue-300 text-[10px] font-medium tracking-wide">Northern Province</div>
              </div>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">Home</a>
              {['Features', 'How It Works', 'About'].map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm text-slate-300 hover:text-white transition-colors font-medium">
                  {link}
                </a>
              ))}
              <button
                id="nav-login-btn"
                onClick={() => navigate('/login')}
                className="ml-2 btn btn-primary text-sm px-5 py-2 shadow-lg shadow-blue-600/30"
              >
                Sign In <ArrowRight size={14} />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-3">
            <a href="#" className="block text-sm text-slate-300 hover:text-white py-1.5 font-medium" onClick={() => setMobileOpen(false)}>Home</a>
            {['Features', 'How It Works', 'About'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                className="block text-sm text-slate-300 hover:text-white py-1.5 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full justify-center text-sm mt-2"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        {/* Animated grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-8 animate-fade-in">
            <Globe size={12} />
            Northern Province · Sri Lanka · Est. MDTU
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 animate-fade-up"
            style={{ animationDelay: '100ms' }}>
            <span className="block">Management Development</span>
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Training Unit
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-300 mt-2">
              Training Management System
            </span>
          </h1>

          {/* Sub */}
          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: '200ms' }}>
            A unified digital platform to plan, manage, and evaluate every aspect of professional
            development training across the Northern Province of Sri Lanka.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-up"
            style={{ animationDelay: '300ms' }}>
            <button
              id="hero-signin-btn"
              onClick={() => navigate('/login')}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-600/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/40"
            >
              Access the System
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/8 hover:bg-white/14 text-white font-semibold text-base border border-white/15 transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Features
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce opacity-50">
            <div className="w-0.5 h-8 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────── */}
      <section ref={statsRef} className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 py-16">
        {/* Decorative top wave */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-50" style={{
          clipPath: 'ellipse(55% 100% at 50% 0%)'
        }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-4">
              <TrendingUp size={12} />
              Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">
              Everything You Need,{' '}
              <span className="text-blue-600">In One Place</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              From programme creation to final evaluation — the TMS covers the entire
              training lifecycle for the MDTU.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-widest mb-4">
                <Clock size={12} />
                Simple Workflow
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">
                How the System
                <span className="text-emerald-600"> Works</span>
              </h2>
              <p className="text-slate-500 mb-8 text-base leading-relaxed">
                The TMS guides every stakeholder — from the Admin to the Participant —
                through a streamlined, role-based workflow.
              </p>
              <div className="space-y-0">
                {steps.map((s, i) => (
                  <TimelineStep key={s.title} step={i + 1} {...s} isLast={i === steps.length - 1} />
                ))}
              </div>
            </div>

            {/* Info card panel */}
            <div className="space-y-4">
              {[
                { icon: Shield, label: 'Role-Based Access Control', desc: 'Admin · Director · Training Officer · Coordinator · Participant', color: 'text-blue-600 bg-blue-50' },
                { icon: Briefcase, label: 'Multi-Institutional Support', desc: 'Manage participants across all institutions in the Northern Province', color: 'text-violet-600 bg-violet-50' },
                { icon: FileText, label: 'Digital Record Keeping', desc: 'All training data is stored securely and instantly accessible', color: 'text-emerald-600 bg-emerald-50' },
                { icon: BarChart3, label: 'Real-Time Dashboards', desc: 'Live metrics and KPIs for decision-makers and administrators', color: 'text-amber-600 bg-amber-50' },
              ].map(item => (
                <div key={item.label} className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 mb-0.5">{item.label}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ────────────────────────────────── */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest mb-4">
                <MapPin size={12} />
                About the Unit
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
                Management Development
                <span className="text-indigo-600"> Training Unit</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-4 text-base">
                The Management Development Training Unit (MDTU) is a provincial-level Training
                Unit under the Northern Province Public Service Commission, dedicated to enhancing
                the professional capacity and administrative skills of public servants.
              </p>
              <p className="text-slate-500 leading-relaxed mb-6 text-base">
                Established to serve the training needs of government institutions across
                the Northern Province of Sri Lanka, the MDTU delivers programmes in management,
                leadership, IT, and public administration.
              </p>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle2, text: 'Accredited training programmes aligned with national standards' },
                  { icon: CheckCircle2, text: 'Qualified resource persons from academia and the public sector' },
                  { icon: CheckCircle2, text: 'Continuous improvement driven by participant feedback' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <item.icon size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-7 space-y-5">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-4">
                Contact &amp; Location
              </h3>
              {[
                { icon: MapPin, label: 'Address', value: 'Management Development Training Unit,\nKanagapuram Road, Kilinochchi,\nNorthern Province, Sri Lanka.' },
                { icon: Phone, label: 'Phone', value: ' +94 021 739 1252' },
                { icon: Mail, label: 'Email', value: ' mdtu.training@gmail.com' },
                { icon: Globe, label: 'Province', value: 'https://mdtu.np.gov.lk/' },
              ].map(c => (
                <div key={c.label} className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <c.icon size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{c.label}</div>
                    <div className="text-sm text-slate-700 whitespace-pre-line leading-snug">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='white'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-widest mb-6">
            <Shield size={12} />
            Authorised Users Only
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-200 text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Sign in with your provided credentials to access the Training Management System.
            Contact your administrator if you need access.
          </p>
          <button
            id="cta-signin-btn"
            onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-white text-blue-700 font-bold text-base shadow-2xl hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-white/20"
          >
            Sign In to TMS
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-500 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">TMS — MDTU</div>
                <div className="text-slate-600 text-[11px]">Northern Province, Sri Lanka</div>
              </div>
            </div>
            <div className="text-[12px] text-center text-slate-600">
              © {new Date().getFullYear()} Management Development Training Unit · Northern Province Public Service
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
              <span>·</span>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <span>·</span>
              <a href="#about" className="hover:text-white transition-colors">About</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
