import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getCurrentLocale, setCurrentLocale, getAvailableLocales, getLocaleConfig } from '../lib/i18n';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocaleState] = useState(getCurrentLocale());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableLocales = getAvailableLocales();
  const currentLocaleConfig = getLocaleConfig(currentLocale);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale as any);
    setCurrentLocaleState(locale as any);
    setIsOpen(false);
    
    // No need to reload the page - the reactive system will handle updates
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <span className="text-lg">{currentLocaleConfig?.flag}</span>
        <span>{currentLocaleConfig?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {availableLocales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                  currentLocale === locale.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{locale.flag}</span>
                <span>{locale.name}</span>
                {currentLocale === locale.code && (
                  <span className="ml-auto text-indigo-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
