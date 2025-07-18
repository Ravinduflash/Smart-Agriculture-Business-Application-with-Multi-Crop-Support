
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
    <div className="space-y-6">      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-textDark">{t('notifications.pageTitle')}</h2>
        {notifications.length > 0 && (
          <button className="text-sm text-primary hover:underline self-start sm:self-auto">{t('notifications.markAllRead')}</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow text-center">
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