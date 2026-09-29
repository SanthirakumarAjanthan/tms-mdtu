import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import {
  LayoutDashboard, Users, BookOpen, UserCheck, UserSquare2,
  CalendarDays, ClipboardList, User2, Settings, LogOut,
  Utensils, DollarSign, ShieldCheck, FileText,
  Menu, Mail, BarChart3, Star, ChevronRight
} from 'lucide-react';

const PROFILE_ITEM = { label: 'My Profile', to: '/app/profile', icon: User2 };

const NAV = {
  Admin: [
    { label: 'Dashboard',              to: '/app/dashboard',               icon: LayoutDashboard },
    { label: 'Staff Details',          to: '/app/staff',                   icon: Users },
    { label: 'Institutions',           to: '/app/institutions',            icon: ShieldCheck },
    { label: 'Courses',                to: '/app/courses',                 icon: BookOpen },
    { label: 'Course Coordinators',    to: '/app/coordinators',            icon: UserSquare2 },
    { label: 'Resource Persons',       to: '/app/resource-persons',        icon: UserCheck },
    { label: 'Resource Qualifications',to: '/app/resource-qualifications', icon: FileText },
    { label: 'Resource Payments',      to: '/app/resource-payments',       icon: DollarSign },
    { label: 'Food Master',            to: '/app/food-items',              icon: Utensils },
    { label: 'User Control',           to: '/app/users',                   icon: Settings },
    { divider: true, label: 'Participant' },
    { label: 'Apply for Training',     to: '/app/apply',                   icon: BookOpen },
    { label: 'Confirm to Training',    to: '/app/my-applications',         icon: UserCheck },
    PROFILE_ITEM,
  ],
  Director: [
    { label: 'Dashboard',             to: '/app/dashboard',             icon: LayoutDashboard },
    { label: 'Training Programmes',   to: '/app/training-programmes',   icon: CalendarDays },
    { label: 'Feedback Summary',      to: '/app/feedback-summary',      icon: BarChart3 },
    PROFILE_ITEM,
  ],
  'Training Officer': [
    { label: 'Dashboard',             to: '/app/dashboard',             icon: LayoutDashboard },
    { label: 'Training Programmes',   to: '/app/training-programmes',   icon: CalendarDays },
    { label: 'Participant Selection', to: '/app/participant-selection',  icon: Users },
    { label: 'Approval Emails',       to: '/app/approval-emails',       icon: Mail },
    { label: 'Attendance',            to: '/app/attendance',            icon: ClipboardList },
    { label: 'Feedback Summary',      to: '/app/feedback-summary',      icon: BarChart3 },
    PROFILE_ITEM,
  ],
  'Course Coordinator': [
    { label: 'Dashboard',             to: '/app/dashboard',             icon: LayoutDashboard },
    { label: 'Training Programmes',   to: '/app/training-programmes',   icon: CalendarDays },
    { label: 'Participant Selection', to: '/app/participant-selection',  icon: Users },
    { label: 'Approval Emails',       to: '/app/approval-emails',       icon: Mail },
    { label: 'Attendance',            to: '/app/attendance',            icon: ClipboardList },
    { label: 'Feedback Summary',      to: '/app/feedback-summary',      icon: BarChart3 },
    PROFILE_ITEM,
  ],
  'Institutional Coordinator': [
    { label: 'Dashboard',             to: '/app/dashboard',             icon: LayoutDashboard },
    { label: 'Apply Training',        to: '/app/apply',                 icon: BookOpen },
    { label: 'My Applications',       to: '/app/my-applications',       icon: FileText },
    PROFILE_ITEM,
  ],
  Participant: [
    { label: 'Dashboard',             to: '/app/dashboard',             icon: LayoutDashboard },
    { label: 'Apply for Training',    to: '/app/apply',                 icon: BookOpen },
    { label: 'Confirm to Training',   to: '/app/my-applications',       icon: UserCheck },
    { label: 'Feedback',              to: '/app/my-feedback',           icon: Star },
    PROFILE_ITEM,
  ],
  Special: [
    { label: 'Dashboard',             to: '/app/dashboard',             icon: LayoutDashboard },
    PROFILE_ITEM,
  ],
};

const ROLE_GRADIENT = {
  Admin: 'from-red-500 to-rose-600',
  Director: 'from-violet-500 to-purple-600',
  'Training Officer': 'from-orange-500 to-amber-600',
  'Course Coordinator': 'from-blue-500 to-blue-700',
  'Institutional Coordinator': 'from-teal-500 to-cyan-600',
  Participant: 'from-emerald-500 to-green-600',
  Special: 'from-slate-500 to-slate-700',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);


  const navItems = NAV[user?.role] || [];
  const handleLogout = () => { logout(); navigate('/'); };
  const gradient = ROLE_GRADIENT[user?.role] || 'from-blue-500 to-blue-700';
  const initial = user?.name?.[0]?.toUpperCase() || '?';
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5]">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ═══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside
        className={`fixed lg:relative z-40 lg:z-auto flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden shadow-xl h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-[60px]' : 'lg:w-[220px]'} w-[220px]`}
        style={{ background: 'linear-gradient(180deg, #0c1a3a 0%, #0f2461 60%, #0c1a3a 100%)' }}>


        {/* Brand header */}
        <div className={`flex items-center h-16 border-b border-white/8 flex-shrink-0 ${!desktopCollapsed ? 'px-4 gap-3' : 'justify-center'}`}>

          <img
            src="/logo.svg"
            alt="MDTU"
            className="w-9 h-9 flex-shrink-0 drop-shadow-md"
          />
          {!desktopCollapsed && (

            <div className="overflow-hidden min-w-0">
              <div className="text-white text-sm font-bold truncate leading-tight">TMS – MDTU</div>
              <div className="text-blue-300 text-[10px] truncate">Northern Province</div>
            </div>
          )}
        </div>

        {/* User profile chip */}
        {!desktopCollapsed ? (

          <button
            onClick={() => navigate('/app/profile')}
            className="mx-3 my-3 flex items-center gap-2.5 p-2.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 transition-all text-left group"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
              {initial}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate leading-tight">{user?.name}</div>
              <div className="text-blue-300 text-[10px] truncate">{user?.role}</div>
            </div>
            <ChevronRight size={12} className="text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/app/profile')}
            className="flex justify-center mt-3 mb-1"
            title={user?.name}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
              {initial}
            </div>
          </button>
        )}

        {/* Nav divider label */}
        {!desktopCollapsed && (

          <div className="px-4 mb-1">
            <span className="text-[10px] font-semibold text-blue-400/60 uppercase tracking-widest">Navigation</span>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto pb-2 px-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {navItems.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={`divider-${idx}`} className={`pt-3 pb-1 ${desktopCollapsed ? 'lg:hidden' : ''}`}>
                  <div className="flex items-center gap-2 px-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[9px] font-bold text-blue-400/50 uppercase tracking-widest whitespace-nowrap">
                      {item.label}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </div>
              );
            }
            const { label, to, icon: Icon } = item;
            return (
              <NavLink key={to} to={to} end={to.endsWith('dashboard')} onClick={closeSidebar}>
                {({ isActive }) => (
                  <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-blue-200/80 hover:bg-white/8 hover:text-white'
                  } ${desktopCollapsed ? 'lg:justify-center' : ''}`}
                    title={desktopCollapsed ? label : undefined}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className={`truncate ${desktopCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>


        {/* Sign out */}
        <div className="px-2 pb-4 pt-2 border-t border-white/8 mt-1">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-all duration-150 ${desktopCollapsed ? 'lg:justify-center' : ''}`}
            title="Sign Out"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className={desktopCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>


      {/* ═══ MAIN AREA ═════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-5 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => {
                // On mobile: open/close overlay; on desktop: collapse/expand
                if (window.innerWidth < 1024) setSidebarOpen(o => !o);
                else setDesktopCollapsed(o => !o);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu size={17} />
            </button>


            {/* Breadcrumb-style title */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700">MDTU</span>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-500">Training Management System</span>
              <span className="hidden md:inline text-slate-300 mx-1">·</span>
              <span className="hidden md:inline text-slate-400 text-xs">Northern Province</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Role pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-semibold shadow-sm`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              {user?.role}
            </div>

            {/* Avatar button */}
            <button
              onClick={() => navigate('/app/profile')}
              title="My Profile"
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all`}
            >
              {initial}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
