import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN',  title: 'English'  },
  { code: 'hi', label: 'HI',  title: 'हिंदी'     },
  { code: 'gu', label: 'ગુ',  title: 'ગુજરાતી'  },
]

export default function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const [current, setCurrent] = useState(
    localStorage.getItem('plm_language') || 'en'
  )

  const handleChange = async (code) => {
    // 1. Change language immediately — instant UI update
    i18n.changeLanguage(code)
    setCurrent(code)

    // 2. Save to localStorage — persists on refresh
    localStorage.setItem('plm_language', code)

    // 3. Save to backend — persists across devices
    //    Non-blocking — don't await
    try {
      const token = localStorage.getItem('token')
        || sessionStorage.getItem('token')

      if (token) {
        fetch(
          `${import.meta.env.VITE_API_URL}/api/preferences/language`,
          {
            method:  'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization:  `Bearer ${token}`,
            },
            body: JSON.stringify({ language: code }),
          }
        ).catch(console.error)
      }
    } catch (err) {
      console.error('Language save error:', err)
    }
  }

  return (
    <div
      style={{
        display:         'flex',
        gap:             '2px',
        background:      'var(--color-bg-hover, #F2F0EB)',
        borderRadius:    '8px',
        padding:         '2px',
        border:          '1px solid var(--color-border, #E8E4DA)',
      }}
      title={t('nav.language')}
    >
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          title={lang.title}
          style={{
            padding:        '5px 10px',
            borderRadius:   '6px',
            border:         'none',
            fontSize:       '12px',
            fontWeight:     current === lang.code ? 700 : 500,
            cursor:         'pointer',
            transition:     'all 150ms ease',
            fontFamily:     'inherit',
            background:     current === lang.code
              ? 'var(--color-bg-card, #FFFFFF)'
              : 'transparent',
            color:          current === lang.code
              ? 'var(--color-text-primary, #1E1D16)'
              : 'var(--color-text-muted, #7A7868)',
            boxShadow:      current === lang.code
              ? '0 1px 3px rgba(0,0,0,0.08)'
              : 'none',
          }}
          onMouseEnter={e => {
            if (current !== lang.code) {
              e.currentTarget.style.color =
                'var(--color-text-primary, #1E1D16)'
              e.currentTarget.style.background =
                'rgba(165,157,132,0.1)'
            }
          }}
          onMouseLeave={e => {
            if (current !== lang.code) {
              e.currentTarget.style.color =
                'var(--color-text-muted, #7A7868)'
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
