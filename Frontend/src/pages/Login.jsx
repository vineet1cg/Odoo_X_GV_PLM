import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Component, CheckCircle, Package, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { login, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const engineeringUserId = users.find(u => u.name.includes('Rishi'))?.id || users[0].id;
  const [selectedRole, setSelectedRole] = useState(engineeringUserId);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Use real users from mock data for floating avatars
  const avatar1 = users[1]; // Ananya
  const avatar2 = users[2]; // Vikram

  const roleConfigs = {
    u1: {
      key: 'u1',
      title: 'Design & Engineer',
      desc: 'Create structured BoMs and drive innovation through seamless revision control.',
      icon: <Component size={48} strokeWidth={1.5} />,
      widgetLabels: ['My Parts', '8 Release Candidates']
    },
    u2: {
      key: 'u2',
      title: 'Review & Approve',
      desc: 'Review and accept engineering change orders with full audit trail compliance.',
      icon: <CheckCircle size={48} strokeWidth={1.5} />,
      widgetLabels: ['ECO Review', '12 Pending Approvals']
    },
    u3: {
      key: 'u3',
      title: 'Manufacturing & Ops',
      desc: 'Access approved BoMs and manufacturing routing sheets from the factory floor.',
      icon: <Package size={48} strokeWidth={1.5} />,
      widgetLabels: ['Production Runs', '3 Active Operations']
    },
    u4: {
      key: 'u4',
      title: 'Total System Control',
      desc: 'Manage users, approval workflows, and the entire product lifecycle network.',
      icon: <Hexagon size={48} strokeWidth={1.5} />,
      widgetLabels: ['System Health', 'All Systems Nominal']
    }
  };

  const config = roleConfigs[selectedRole] || roleConfigs.u1;
  const selectedUser = users.find(u => u.id === selectedRole);

  const handleQuickLoginClick = async (user) => {
    setSelectedRole(user.id);
    setEmail(user.email);
    setPassword('password123');
    setError('');
    
    // Optionally trigger immediate login (commented out to allow them to click sign in as requested in earlier prompt)
    // If they want true '1-click' dynamic login without pressing sign in, uncomment this 
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FCFAF8] font-sans text-surface-900 overflow-hidden">
      
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-20 overflow-y-auto py-10 border-r border-surface-200/60">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <img src="/logo.svg" alt="PLM Logo" className="w-full h-full object-contain" loading="lazy" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[20px] leading-none font-extrabold text-primary-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                PLM
              </span>
              <span className="text-[9px] leading-tight text-[#a19982] font-bold tracking-widest uppercase mt-0.5">
                Change Control
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight leading-snug">
            {t('auth.welcome_back')}
          </h1>
          <p className="text-surface-400 mb-8 text-[15px] leading-relaxed">
            {t('auth.login_subtitle')}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder={t('auth.email')}
                className="w-full px-5 py-[14px] rounded-2xl border border-surface-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-surface-400 font-medium text-[15px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                className="w-full px-5 py-[14px] rounded-2xl border border-surface-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-surface-400 font-medium text-[15px] tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <span className="text-[13px] font-semibold text-surface-400 cursor-not-allowed select-none">
                {t('auth.forgot')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-[15px] bg-primary-900 text-white rounded-2xl font-bold text-[15px] hover:bg-primary-800 active:scale-[0.99] transition-all shadow-lg shadow-primary-900/20 mt-1 disabled:opacity-60"
            >
              {loading ? t('auth.signing_in') : t('auth.login')}
            </button>
          </form>

          {/* Mobile-only Quick Login (Hidden on Desktop) */}
          <div className="mt-8 lg:hidden block">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-surface-400">{t('auth.demo_accounts')}</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {users.map(user => {
                const isActive = selectedRole === user.id;
                return (
                  <button
                    key={'mobile-' + user.id}
                    type="button"
                    onClick={() => handleQuickLoginClick(user)}
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E5D5C5] border-[#d1bfab] text-[#1b3b64] shadow-sm'
                        : 'bg-[#F4EBE1] border-[#EADBC8] text-[#1b3b64]'
                    }`}
                  >
                    {user.role}
                  </button>
                );
              })}
            </div>
          </div>



          {/* Footer */}
          <p className="mt-8 text-center text-[13px] font-medium text-surface-400">
            {t('auth.not_member')}{' '}
            <a href="#" className="text-primary-700 hover:text-primary-900 hover:underline font-bold">
              {t('auth.contact_admin')}
            </a>
          </p>

        </motion.div>
      </div>

      {/* Right Side: Quick Login & Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full h-full bg-primary-900 rounded-3xl overflow-hidden flex flex-col justify-between relative border border-primary-800"
        >
          {/* Background FX */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-[30%] -right-[20%] w-[80%] h-[80%] bg-primary-700/40 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.4, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-[#b68a56]/20 rounded-full blur-[100px]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-transparent to-transparent" />
          </div>

          {/* Hologram Center */}
          <div className="relative flex-1 w-full flex items-center justify-center p-8 mt-10 z-10">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`center-${config.key}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative bg-white/5 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-[32px] px-10 py-10 flex flex-col items-center border border-white/10 w-full max-w-sm ring-1 ring-white/5"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-[#E5D5C5] to-[#b68a56] rounded-2xl flex items-center justify-center text-primary-900 mb-7 shadow-inner">
                  {config.icon}
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight text-center">{config.title}</h2>
                <p className="text-primary-100/60 text-center text-[14px] leading-relaxed">{config.desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Floating Avatars — use real names */}
            <motion.div 
              animate={{ y: [-12, 12, -12], rotate: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-[4%] left-[8%] bg-white/10 backdrop-blur-xl rounded-full p-1.5 border border-white/20 shadow-2xl"
            >
              <div className="w-13 h-13 w-12 h-12 bg-gradient-to-tr from-surface-100 to-white rounded-full flex items-center justify-center text-primary-900 font-extrabold text-sm">
                {avatar1?.avatar || 'AS'}
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [15, -15, 15], rotate: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[22%] right-[4%] bg-white/10 backdrop-blur-xl rounded-full p-1.5 border border-white/20 shadow-2xl"
            >
              <div className="w-14 h-14 bg-gradient-to-bl from-[#E5D5C5] to-[#d9c4aa] rounded-full flex items-center justify-center text-primary-900 font-extrabold text-sm">
                {avatar2?.avatar || 'VD'}
              </div>
            </motion.div>

            {/* Floating Widget — animates on role switch */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`widget-${config.key}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0, y: [-8, 8, -8] }}
                exit={{ opacity: 0, x: 30 }}
                transition={{
                  opacity: { duration: 0.25 },
                  x: { type: "spring", stiffness: 200, damping: 20 },
                  y: { repeat: Infinity, duration: 7, ease: "easeInOut" }
                }}
                className="absolute top-[68%] -left-[2%] bg-white/10 backdrop-blur-2xl rounded-2xl p-5 border border-white/20 w-60 shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
              >
                <p className="font-extrabold text-white text-[15px] mb-0.5">{config.widgetLabels[0]}</p>
                <p className="text-[12px] text-primary-200/70 mb-4 font-medium">{config.widgetLabels[1]}</p>
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-success-500/20 text-success-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-success-500/30">
                    Active
                  </div>
                  <div className="flex items-center gap-1.5 text-success-400">
                    <span className="text-[12px] font-extrabold">100%</span>
                    <CheckCircle size={13} strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom White Card: Quick Login */}
          <div className="relative z-20 m-5 mt-0 bg-white/95 backdrop-blur-3xl rounded-[28px] p-7 border border-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.25)] flex flex-col items-center">
            
            {/* PLM Brand Tag */}
            <div className="flex flex-col items-center gap-1.5 mb-6">
              <p className="text-[13px] font-medium text-surface-400 text-center">{t('auth.make_easier')}</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                  <img src="/logo.svg" alt="PLM Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl leading-none font-extrabold text-primary-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    PLM
                  </span>
                  <span className="text-[10px] leading-tight text-[#a19982] font-bold tracking-widest uppercase mt-0.5">
                    Change Control
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[90%] flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#d9c4aa]/40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b68a56]">{t('auth.quick_login')}</span>
              <div className="flex-1 h-px bg-[#d9c4aa]/40" />
            </div>

            {/* Role Pills */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {users.map(user => {
                const isActive = selectedRole === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLoginClick(user)}
                    className={`px-5 py-2.5 rounded-full border text-[13px] font-semibold flex items-center gap-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E5D5C5] border-[#d1bfab] text-[#1b3b64] shadow-md scale-[1.04] ring-2 ring-[#d9c4aa]/60'
                        : 'bg-[#F4EBE1] border-[#EADBC8] text-[#1b3b64] hover:bg-[#ecdfd2] hover:-translate-y-0.5 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-extrabold text-[11px] transition-colors ${
                      isActive ? 'bg-[#DDEAF5] text-[#1b3b64]' : 'bg-[#EEF4FA] text-[#1b3b64]'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    {user.role}
                  </button>
                );
              })}
            </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
