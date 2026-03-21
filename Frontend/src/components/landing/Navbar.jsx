import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Menu, X } from 'lucide-react'
import TealButton from './ui/TealButton'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: t('landing.nav.features', 'Features'), href: '#features' },
    { label: t('landing.nav.how_it_works', 'How it works'), href: '#how-it-works' },
    { label: t('landing.nav.roles', 'Roles'), href: '#roles' },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 border-b border-black/5 ${
        scrolled ? 'bg-[#EADBC8]/80 backdrop-blur-md py-3 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-black/10' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative z-50">
          <div className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img src="/logo.svg" alt="PLM Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl leading-none font-extrabold text-primary-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              PLM
            </span>
            <span className="text-[10px] leading-tight text-[#a19982] font-bold tracking-widest uppercase mt-0.5">
              {t('landing.logo_subtitle', 'Change Control')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors relative group py-2"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-teal-400 transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4 relative z-50">
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
            {t('auth.login', 'Sign In')}
          </Link>
          <Link to="/login">
            <TealButton size="sm" glow>{t('landing.get_started', 'Get Started')}</TealButton>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden relative z-50 p-2 text-slate-800 hover:text-teal-600 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <div className={`
          fixed inset-0 bg-[#EADBC8] z-40 transition-transform duration-500 ease-in-out md:hidden flex flex-col pt-24 px-6
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full underline'}
        `}>
          <nav className="flex flex-col gap-6 text-xl font-bold">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-slate-800 hover:text-teal-600 border-b border-black/5 pb-4 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-10 flex flex-col gap-4">
            <Link 
              to="/login" 
              className="w-full py-4 text-center rounded-xl bg-white/50 border border-black/5 text-slate-800 font-bold hover:bg-white/80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('auth.login', 'Sign In')}
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <TealButton className="w-full py-4 justify-center text-lg italic shadow-xl" size="lg" glow>{t('landing.get_started_now', 'Get Started Now')}</TealButton>
            </Link>
          </div>
        </div>

      </div>
    </header>
  )
}
