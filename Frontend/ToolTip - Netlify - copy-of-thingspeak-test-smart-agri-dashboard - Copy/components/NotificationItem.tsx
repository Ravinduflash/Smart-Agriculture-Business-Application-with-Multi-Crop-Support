
import React, { useContext } from 'react';
import { NotificationMessage } from '../types';
import { IconInfo, IconWarning, IconSuccess, IconError } from '../constants';
import { LanguageContext } from '../contexts/LanguageContext';

const NotificationItem: React.FC<{ notification: NotificationMessage }> = ({ notification }) => {
  const { t } = useContext(LanguageContext);
    const getIcon = () => {
    switch (notification.type) {
      case 'info': return notification.icon || <IconInfo className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case 'warning': return notification.icon || <IconWarning className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
      case 'success': return notification.icon || <IconSuccess className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'error': return notification.icon || <IconError className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default: return <IconInfo className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'info': return 'border-blue-500';
      case 'warning': return 'border-yellow-500';
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      default: return 'border-gray-300';
    }
  };
  // Format timestamp to readable format
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // For older notifications, show formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-card p-3 sm:p-4 rounded-lg shadow-md border-l-4 ${getBorderColor()} flex items-start space-x-2 sm:space-x-3`}>
      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
        {getIcon()}
      </div>
      <div className="min-w-0 flex-1">
        {notification.title && (
          <p className="text-sm sm:text-base font-semibold text-textDark break-words mb-1">
            {notification.title}
          </p>
        )}
        <p className="text-xs sm:text-sm text-textDark break-words">
          {notification.message || (notification.messageKey ? t(notification.messageKey) : '')}
        </p>
        <p className="text-xs text-textMedium mt-1">{formatTimestamp(notification.timestamp)}</p>
      </div>
    </div>
  );
};

export default NotificationItem;