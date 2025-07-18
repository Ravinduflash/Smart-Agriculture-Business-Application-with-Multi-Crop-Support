
import React, { useState, useEffect, useContext } from 'react';
import { NotificationMessage } from '../types';
import { getMockNotifications } from '../services/mockDataService';
import NotificationItem from '../components/NotificationItem';
import { LanguageContext } from '../contexts/LanguageContext';

const NotificationsPage: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    setNotifications(getMockNotifications());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-textDark">{t('notifications.pageTitle')}</h2>
        {notifications.length > 0 && (
          <button className="text-sm text-primary hover:underline">{t('notifications.markAllRead')}</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card p-6 rounded-lg shadow text-center">
          <p className="text-textMedium">{t('notifications.noNotifications')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;