import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'
import gu from './gu.json'

// Get saved language from localStorage
// Falls back to 'en' if nothing saved
const savedLanguage = localStorage.getItem('plm_language') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      gu: { translation: gu },
    },
    lng:          savedLanguage,
    fallbackLng:  'en',
    interpolation: {
      escapeValue: false
    },
  })

export default i18n
