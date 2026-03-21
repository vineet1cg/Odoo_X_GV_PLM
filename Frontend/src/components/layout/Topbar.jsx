// ============================================================//
//  Topbar.jsx — HEADER: Search + Notifications + User Info    //
//  Bell icon with unread count badge                          //
//  User info with Logout button                               //
// ============================================================//
import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '../search/GlobalSearch';
import DBStatusBadge from '../admin/DBStatusBadge';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from 'react-i18next';

export default function Topbar({ setMobileMenuOpen }) {
  const { currentUser, logout, notificationList, markNotificationRead } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const unreadCount = notificationList.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleColors = {
    'Engineering User': 'bg-blue-100 text-blue-700',
    'Approver': 'bg-amber-100 text-amber-700',
    'Operations User': 'bg-green-100 text-green-700',
    'Admin': 'bg-purple-100 text-purple-700',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-surface-50/80 backdrop-blur-md shadow-sm border-b border-surface-200/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3 w-full max-w-md">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="sm:hidden p-2 -ml-2 text-surface-500 hover:bg-surface-50 rounded-lg"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative flex-1 hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <button
            onClick={() => setShowGlobalSearch(true)}
            className="w-full text-left pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-400 focus:outline-none hover:border-primary-300 hover:bg-white transition-all flex justify-between items-center"
          >
            <span className="truncate">{t('eco.search')}</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-slate-400">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowGlobalSearch(true)}
          className="sm:hidden p-2 text-surface-500 hover:bg-surface-50 rounded-lg"
        >
          <Search size={20} />
        </button>

        <LanguageToggle />

        {/* DB Status Badge */}
        <DBStatusBadge />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <Bell size={20} className="text-surface-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-surface-100 rounded-xl shadow-xl border border-surface-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-800">{t('nav.notifications', 'Notifications')}</h3>
                {unreadCount > 0 && <span className="text-xs text-primary-600 font-medium">{unreadCount} {t('common.new', 'new')}</span>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificationList.length === 0 && (
                  <p className="px-4 py-6 text-sm text-surface-400 text-center">{t('nav.no_notifications', 'No notifications yet')}</p>
                )}
                {notificationList.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.ecoId) {
                        navigate(`/eco/${n.ecoId}`);
                        setShowNotif(false);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-primary-50/40' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                    <div>
                      <p className={`text-sm ${!n.read ? 'font-medium text-surface-800' : 'text-surface-600'}`}>{n.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{n.timestamp}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{currentUser.avatar}</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-surface-800 leading-tight">{currentUser.name}</p>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${roleColors[currentUser.role]}`}>
              {t(`roles.${currentUser.role}`, currentUser.role)}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={t('nav.sign_out')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <GlobalSearch open={showGlobalSearch} setOpen={setShowGlobalSearch} />
    </header>
  );
}
