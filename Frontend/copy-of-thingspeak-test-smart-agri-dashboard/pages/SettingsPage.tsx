
import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="space-y-6 bg-card p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-textDark">{t('settings.pageTitle')}</h2>
      
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">{t('settings.profile.title')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('settings.profile.description')}</p>
        <div className="mt-4 space-y-3">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t('settings.profile.label.fullName')}</label>
                <input type="text" name="fullName" id="fullName" defaultValue={t('header.adminUser')} className="mt-1 block w-full md:w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"/>
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('settings.profile.label.emailAddress')}</label>
                <input type="email" name="email" id="email" defaultValue="admin@smartagri.example.com" className="mt-1 block w-full md:w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"/>
            </div>
            <button type="button" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                {t('settings.buttons.saveChanges')}
            </button>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4 pt-4">
        <h3 className="text-lg font-medium text-gray-900">{t('settings.notifications.title')}</h3>
        <p className="mt-1 text-sm text-gray-600">{t('settings.notifications.description')}</p>
        <div className="mt-4 space-y-3">
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="emailNotifications" name="emailNotifications" type="checkbox" defaultChecked className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="emailNotifications" className="font-medium text-gray-700">{t('settings.notifications.email.label')}</label>
                    <p className="text-gray-500">{t('settings.notifications.email.description')}</p>
                </div>
            </div>
             <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="pushNotifications" name="pushNotifications" type="checkbox" className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"/>
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="pushNotifications" className="font-medium text-gray-700">{t('settings.notifications.push.label')}</label>
                    <p className="text-gray-500">{t('settings.notifications.push.description')}</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900">{t('settings.apiKey.title')}</h3>
        <p className="mt-1 text-sm text-gray-600">
            {t('settings.apiKey.description')}
        </p>
      </div>

       <p className="text-textMedium mt-8 text-center">
        {t('settings.footer.moreSettings')}
      </p>
    </div>
  );
};

export default SettingsPage;