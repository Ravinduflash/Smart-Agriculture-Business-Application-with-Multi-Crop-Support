
import React, { useContext } from 'react';
import { NotificationMessage } from '../types';
import { IconInfo, IconWarning, IconSuccess, IconError } from '../constants';
import { LanguageContext } from '../contexts/LanguageContext';

const NotificationItem: React.FC<{ notification: NotificationMessage }> = ({ notification }) => {
  const { t } = useContext(LanguageContext);
  
  const getIcon = () => {
    switch (notification.type) {
      case 'info': return notification.icon || <IconInfo className="w-5 h-5 text-blue-500" />;
      case 'warning': return notification.icon || <IconWarning className="w-5 h-5 text-yellow-500" />;
      case 'success': return notification.icon || <IconSuccess className="w-5 h-5 text-green-500" />;
      case 'error': return notification.icon || <IconError className="w-5 h-5 text-red-500" />;
      default: return <IconInfo className="w-5 h-5 text-gray-500" />;
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

  return (
    <div className={`bg-card p-4 rounded-lg shadow-md border-l-4 ${getBorderColor()} flex items-start space-x-3`}>
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      <div>
        <p className="text-sm font-medium text-textDark">{t(notification.messageKey)}</p>
        <p className="text-xs text-textMedium">{notification.timestamp}</p>
      </div>
    </div>
  );
};

export default NotificationItem;