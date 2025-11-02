import React, { useState, useEffect, useContext } from 'react';
import { IconUserCircle, IconChevronDown, IconNotification, IconLanguage, IconHelp, LanguageOption, LANGUAGES } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTooltipManager } from '../hooks/useTooltipManager';
import { useAuth } from '../src/contexts/AuthContext';
import { authService } from '../src/services/authService';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage, t } = useContext(LanguageContext);
  const { isTooltipEnabled, toggleTooltip } = useTooltipManager();
  const { currentUser, userProfile } = useAuth();

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

  const handleSignOut = async () => {
    const result = await authService.signOutUser();
    if (result.success) {
      navigate('/login');
    }
    setUserDropdownOpen(false);
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
    <header className="bg-card shadow-sm h-14 sm:h-16 flex items-center justify-between px-2 sm:px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden mr-2 sm:mr-4 p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 flex-shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-textDark truncate min-w-0">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
        {/* Date and Time Display */}
        <div className="text-xs text-gray-700 hidden lg:block whitespace-nowrap">
          {formattedDateTime()}
        </div>

        {/* Tooltip Toggle Button - Always visible */}
        <button
          onClick={toggleTooltip}
          className={`relative p-1.5 sm:p-2 rounded-md transition-colors duration-200 border-2 flex items-center gap-1 ${
            isTooltipEnabled 
              ? 'text-green-600 bg-green-50 hover:bg-green-100 border-green-300' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-gray-300'
          }`}
          aria-label="Toggle Tooltips"
          title={isTooltipEnabled ? "Disable tooltips" : "Enable tooltips"}
        >
          <IconHelp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          <span className="text-xs font-medium hidden sm:inline">Tips</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            className="relative text-gray-500 hover:text-primary p-1.5 sm:p-2"
            aria-label={t('header.changeLanguage')}
            aria-expanded={languageDropdownOpen}
            aria-haspopup="true"
          >
            <IconLanguage className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button>
          {languageDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-50 border" role="menu">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  role="menuitem"
                  className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm ${currentLanguage === lang.code ? 'bg-primary-light text-primary-dark font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {lang.nativeName} ({lang.name})
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleNotificationClick}
          className="relative text-gray-500 hover:text-primary p-1.5 sm:p-2"
          aria-label={t('header.viewNotifications')}
        >
          <IconNotification className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 sm:ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center text-xs sm:text-sm text-gray-700 hover:text-primary focus:outline-none p-1.5 sm:p-2"
            aria-expanded={userDropdownOpen}
            aria-haspopup="true"
          >
            <IconUserCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full mr-1" />
            <span className="hidden md:block text-xs sm:text-sm">{userProfile?.displayName || currentUser?.displayName || t('header.adminUser')}</span>
            <IconChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 transform transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-50 border" role="menu">
              <button 
                role="menuitem" 
                onClick={() => { navigate('/settings'); setUserDropdownOpen(false); }}
                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
              >
                {t('header.dropdown.profile')}
              </button>
              <button 
                role="menuitem" 
                onClick={() => { navigate('/settings'); setUserDropdownOpen(false); }}
                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
              >
                {t('header.dropdown.settings')}
              </button>
              <button 
                role="menuitem" 
                onClick={handleSignOut}
                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
              >
                {t('header.dropdown.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;