import React, { useState, useEffect, useContext } from 'react';
import { IconUserCircle, IconChevronDown, IconSettings, IconNotification, IconLanguage, LanguageOption, LANGUAGES } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';


const Header: React.FC = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage, t } = useContext(LanguageContext);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timerId); // Cleanup interval on component unmount
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('header.title.dashboard');
    if (path.startsWith('/crop-management')) return t('header.title.cropManagement');
    if (path.startsWith('/iot-sensors')) return t('header.title.iotSensors');
    if (path.startsWith('/analytics')) return t('header.title.analytics');
    if (path.startsWith('/ml-models')) return t('header.title.mlModels');
    if (path.startsWith('/notifications')) return t('header.title.notifications');
    if (path.startsWith('/settings')) return t('header.title.settings');
    return t('app.title'); 
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleLanguageChange = (langCode: LanguageOption['code']) => {
    changeLanguage(langCode);
    setLanguageDropdownOpen(false);
  };
  
  const formattedDateTime = () => {
    const optionsDate: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    // Use currentLanguage from context to hint at locale, though Intl defaults well
    const localeForFormatting = currentLanguage || 'en-US'; 
    return `${currentDateTime.toLocaleTimeString(localeForFormatting, optionsTime)} - ${currentDateTime.toLocaleDateString(localeForFormatting, optionsDate)}`;
  };

  return (
    <header className="bg-card shadow-sm h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-textDark">{getPageTitle()}</h1>
      <div className="flex items-center space-x-4">
        {/* Date and Time Display */}
        <div className="text-sm text-gray-700 hidden md:block">
          {formattedDateTime()}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            className="relative text-gray-500 hover:text-primary"
            aria-label={t('header.changeLanguage')}
            aria-expanded={languageDropdownOpen}
            aria-haspopup="true"
          >
            <IconLanguage className="w-6 h-6" />
          </button>
          {languageDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" role="menu">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  role="menuitem"
                  className={`block w-full text-left px-4 py-2 text-sm ${currentLanguage === lang.code ? 'bg-primary-light text-primary-dark font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {lang.nativeName} ({lang.name})
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleNotificationClick}
          className="relative text-gray-500 hover:text-primary"
          aria-label={t('header.viewNotifications')}
        >
          <IconNotification className="w-6 h-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center text-sm text-gray-700 hover:text-primary focus:outline-none"
            aria-expanded={userDropdownOpen}
            aria-haspopup="true"
          >
            <IconUserCircle className="w-8 h-8 rounded-full mr-2" />
            <span>{t('header.adminUser')}</span>
            <IconChevronDown className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" role="menu">
              <a href="#profile" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header.dropdown.profile')}</a>
              <a href="#settings" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header.dropdown.settings')}</a>
              <a href="#logout" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('header.dropdown.logout')}</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;