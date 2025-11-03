
import React, { useState, useEffect, useContext } from 'react';
import { NotificationMessage } from '../types';
import NotificationItem from '../components/NotificationItem';
import { LanguageContext } from '../contexts/LanguageContext';
import { notificationService } from '../services/notificationService';
import Spinner from '../components/Spinner';

const NotificationsPage: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to real-time notifications from Firestore
    const unsubscribe = notificationService.subscribeToNotifications((newNotifications) => {
      setNotifications(newNotifications);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      console.log('✅ All notifications marked as read');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-textDark">{t('notifications.pageTitle')}</h2>
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:underline self-start sm:self-auto"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
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