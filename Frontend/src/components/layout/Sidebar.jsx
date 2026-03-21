// ============================================================//
//  Sidebar.jsx — ROLE-FILTERED NAVIGATION                     //
//  Each role sees different menu items                         //
//  roleNavMap object on line ~10 controls what each role sees  //
// ============================================================//
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, FileText, BarChart3, Settings, ChevronLeft, ChevronRight, X, Hexagon, Inbox, Users, GitMerge, ShieldCheck, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ==========================================//
//  ROLE NAV MAP — Different menu per role   //
//  Admin: settings, users, stages, rules    //
//  Engineer: products, boms, create ECO     //
//  Approver: pending approvals, reports     //
//  Operations: products/boms (active only)  //
// ==========================================//
const roleNavMap = {
  'Admin': [
    { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', fallback: 'Dashboard' },
    { to: '/users', icon: Users, labelKey: 'admin.users', fallback: 'User Management' },
    { to: '/eco-stages', icon: GitMerge, labelKey: 'nav.eco_stages', fallback: 'ECO Stages' },
    { to: '/rules', icon: ShieldCheck, labelKey: 'nav.approval_rules', fallback: 'Approval Rules' },
    { to: '/reports', icon: BarChart3, labelKey: 'nav.reports', fallback: 'Reports' },
    { to: '/settings', icon: Settings, labelKey: 'nav.settings', fallback: 'Settings' },
  ],
  'Engineering User': [
    { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', fallback: 'Dashboard' },
    { to: '/products', icon: Package, labelKey: 'nav.products', fallback: 'Products' },
    { to: '/bom', icon: Layers, labelKey: 'nav.boms', fallback: 'Bills of Materials' },
    { to: '/eco/create', icon: PlusCircle, labelKey: 'eco.create', fallback: 'Create ECO' },
    { to: '/eco', icon: FileText, labelKey: 'nav.ecos', fallback: 'My ECOs' },
  ],
  'Approver': [
    { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', fallback: 'Dashboard' },
    { to: '/eco', icon: Inbox, labelKey: 'nav.ecos_pending', fallback: 'Pending Approvals' },
    { to: '/reports', icon: BarChart3, labelKey: 'nav.reports', fallback: 'Reports' },
  ],
  'Operations User': [
    { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', fallback: 'Dashboard' },
    { to: '/products', icon: Package, labelKey: 'nav.products_active', fallback: 'Products (Active)' },
    { to: '/bom', icon: Layers, labelKey: 'nav.boms_active', fallback: 'BoM (Active)' },
  ],
};

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen, collapsed, setCollapsed }) {
  const { currentUser } = useApp();
  const location = useLocation();
  const { t } = useTranslation();

  const filteredNav = roleNavMap[currentUser.role] || roleNavMap['Engineering User'];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Handle resize specifically for clearing mobile menu state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileMenuOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-surface-900/40 z-40 sm:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-[100dvh] bg-surface-100 border-r border-surface-200 z-50 flex flex-col shadow-xl sm:shadow-sm transition-all duration-300 group
          ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full sm:translate-x-0'}
          ${!mobileMenuOpen ? (collapsed ? 'sm:w-[72px]' : 'sm:w-[72px] lg:w-64') : ''}
          ${!mobileMenuOpen && !collapsed ? 'hover:w-64' : ''}
        `}
      >
      {/* Logo */}
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200 bg-surface-50 relative z-10">
        <div className="flex items-center gap-3 min-w-0 h-full">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <img src="/logo.svg" alt="PLM Logo" className="w-full h-full object-contain" />
          </div>
          
          {(!collapsed || mobileMenuOpen) && (
            <div className={`flex flex-col justify-center overflow-hidden whitespace-nowrap transition-all duration-300 ${(!collapsed || mobileMenuOpen) ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              <h1 className="text-[20px] leading-none font-extrabold text-primary-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                PLM
              </h1>
              <p className="text-[9px] leading-tight text-surface-500 font-bold tracking-widest uppercase mt-1">
                {t('landing.logo_subtitle', 'Change Control')}
              </p>
            </div>
          )}
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="sm:hidden p-1.5 -mr-2 text-surface-400 hover:text-surface-700 hover:bg-surface-200 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {(() => {
          const activeNavTo = filteredNav.reduce((best, item) => {
            if (item.to === '/dashboard') return location.pathname === '/dashboard' ? item.to : best;
            if (location.pathname === item.to || location.pathname.startsWith(item.to + '/')) {
              if (!best || item.to.length > best.length) return item.to;
            }
            return best;
          }, '');

          return filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === activeNavTo;
            return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-surface-200 text-primary-900 shadow-sm border border-surface-300/50'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-primary-800'
              }`}
              title={collapsed ? t(item.labelKey, item.fallback) : undefined}
            >
              <Icon size={20} className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-800' : 'text-surface-500 group-hover:text-primary-700'}`} />
              {(!collapsed || mobileMenuOpen) && (
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${mobileMenuOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 lg:w-auto lg:opacity-100'} ${collapsed ? '!w-0 !opacity-0' : ''}`}
                  >
                    {t(item.labelKey, item.fallback)}
                  </span>
                )}
            </NavLink>
          );
        })})()}
      </nav>

      <div className="p-3 border-t border-surface-200 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && (
              <span
                className="text-xs font-medium"
              >
                {t('common.collapse', 'Collapse')}
              </span>
            )}
        </button>
      </div>
    </aside>
    </>
  );
}
