
import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="space-y-4 sm:space-y-6 bg-card p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg max-w-full">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-textDark break-words">{t('settings.pageTitle')}</h2>
      
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">{t('settings.profile.title')}</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">{t('settings.profile.description')}</p>
        <div className="mt-3 sm:mt-4 space-y-3">
            <div>
                <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('settings.profile.label.fullName')}</label>
                <input type="text" name="fullName" id="fullName" defaultValue={t('header.adminUser')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-xs sm:text-sm text-gray-900 p-2 sm:p-3"/>
            </div>
            <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('settings.profile.label.emailAddress')}</label>
                <input type="email" name="email" id="email" defaultValue="admin@smartagri.example.com" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-xs sm:text-sm text-gray-900 p-2 sm:p-3"/>
            </div>
            <button type="button" className="px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark w-full sm:w-auto">
                {t('settings.buttons.saveChanges')}
            </button>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-3 sm:pb-4 pt-3 sm:pt-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">{t('settings.notifications.title')}</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">{t('settings.notifications.description')}</p>
        <div className="mt-3 sm:mt-4 space-y-3">
            <div className="flex items-start">
                <div className="flex items-center h-5 flex-shrink-0">
                    <input id="emailNotifications" name="emailNotifications" type="checkbox" defaultChecked className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-xs sm:text-sm min-w-0 flex-1">
                    <label htmlFor="emailNotifications" className="font-medium text-gray-700 block">{t('settings.notifications.email.label')}</label>
                    <p className="text-gray-500 break-words">{t('settings.notifications.email.description')}</p>
                </div>
            </div>
             <div className="flex items-start">
                <div className="flex items-center h-5 flex-shrink-0">
                    <input id="pushNotifications" name="pushNotifications" type="checkbox" className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-xs sm:text-sm min-w-0 flex-1">
                    <label htmlFor="pushNotifications" className="font-medium text-gray-700 block">{t('settings.notifications.push.label')}</label>
                    <p className="text-gray-500 break-words">{t('settings.notifications.push.description')}</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="pt-3 sm:pt-4">
        <h3 className="text-sm sm:text-lg font-medium text-gray-900">{t('settings.apiKey.title')}</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-600 break-words">
            {t('settings.apiKey.description')}
        </p>
      </div>

       <p className="text-textMedium mt-6 sm:mt-8 text-center text-xs sm:text-sm">
        {t('settings.footer.moreSettings')}
      </p>
    </div>
  );
};

export default SettingsPage;