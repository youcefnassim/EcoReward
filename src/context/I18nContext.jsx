import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  FR: {
    dashboard: 'Tableau de bord',
    rewards: 'Récompenses',
    map: 'Carte',
    settings: 'Paramètres',
    welcome: 'Bienvenue 👋',
    level: 'NIVEAU',
    points: 'DA',
    scan_to_recycle: 'Recycler',
    recent_activity: 'Activités',
    see_all: 'Tout voir',
    shop: 'Boutique',
    history: 'Historique',
    leaderboard: 'Classement',
    eco_impact: 'Impact Éco',
    co2_saved: 'CO2 Économisé',
    water_saved: 'Eau Préservée',
    logout: 'SE DÉCONNECTER',
    language: 'Langue',
    dark_mode: 'Mode Sombre',
    notifications: 'Notifications',
    support: 'SUPPORT',
    faq: 'Centre d\'aide & FAQ',
    privacy: 'Confidentialité',
    edit_profile: 'Éditer le profil',
    my_badges: 'MES BADGES',
    preferences: 'PRÉFÉRENCES',
    no_activity: 'Aucune activité récente',
    home: 'Accueil'
  },
  AR: {
    dashboard: 'لوحة القيادة',
    rewards: 'المكافآت',
    map: 'الخريطة',
    settings: 'الإعدادات',
    welcome: 'مرحباً 👋',
    level: 'مستوى',
    points: 'د.ج',
    scan_to_recycle: 'إعادة التدوير',
    recent_activity: 'النشاطات',
    see_all: 'عرض الكل',
    shop: 'المتجر',
    history: 'السجل',
    leaderboard: 'الترتيب',
    eco_impact: 'التأثير البيئي',
    co2_saved: 'ثاني أكسيد الكربون الموفر',
    water_saved: 'المياه المحفوظة',
    logout: 'تسجيل الخروج',
    language: 'اللغة',
    dark_mode: 'الوضع الداكن',
    notifications: 'الإشعارات',
    support: 'الدعم',
    faq: 'مركز المساعدة والأسئلة',
    privacy: 'الخصوصية',
    edit_profile: 'تعديل الملف',
    my_badges: 'شاراتي',
    preferences: 'التفضيلات',
    no_activity: 'لا يوجد نشاط حديث',
    home: 'الرئيسية'
  }
};

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('eco_lang') || 'FR');

  useEffect(() => {
    localStorage.setItem('eco_lang', lang);
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    if (lang === 'AR') {
      document.documentElement.classList.add('font-arabic');
    } else {
      document.documentElement.classList.remove('font-arabic');
    }
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
