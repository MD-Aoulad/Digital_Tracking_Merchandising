import React from 'react';
import { getCurrentLocale, addLanguageChangeListener, removeLanguageChangeListener } from './i18n';

// React hook for language changes
export function useLanguageChange() {
  const [currentLocale, setCurrentLocaleState] = React.useState(getCurrentLocale());
  
  React.useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLocaleState(getCurrentLocale());
    };
    
    addLanguageChangeListener(handleLanguageChange);
    return () => removeLanguageChangeListener(handleLanguageChange);
  }, []);
  
  return currentLocale;
} 