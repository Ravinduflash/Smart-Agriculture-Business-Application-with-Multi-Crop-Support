import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { IconDashboard, IconCrop, IconSensor, IconAnalytics, IconNotification, IconSettings, IconLeaf, IconChip } from '../constants';
import { LanguageContext } from '../contexts/LanguageContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
       ${isActive ? 'bg-primary-dark text-white' : 'text-gray-200 hover:bg-primary hover:text-white'}`
    }
  >
    {icon}
    <span className="ml-3">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  const { t } = useContext(LanguageContext);

  const navItems = [
    { to: '/', icon: <IconDashboard className="w-5 h-5" />, label: t('sidebar.dashboard') },
    { to: '/crop-management', icon: <IconCrop className="w-5 h-5" />, label: t('sidebar.cropManagement') },
    { to: '/iot-sensors', icon: <IconSensor className="w-5 h-5" />, label: t('sidebar.iotSensors') },
    { to: '/analytics', icon: <IconAnalytics className="w-5 h-5" />, label: t('sidebar.analyticsReports') },
    { to: '/ml-models', icon: <IconChip className="w-5 h-5" />, label: t('sidebar.mlModels') },
    { to: '/notifications', icon: <IconNotification className="w-5 h-5" />, label: t('sidebar.notifications') },
  ];

  const settingNavItems = [
     { to: '/settings', icon: <IconSettings className="w-5 h-5" />, label: t('sidebar.settings') },
  ];

  return (
    <aside className="w-64 bg-primary-darker text-textLight flex flex-col p-4 space-y-4" style={{backgroundColor: '#065f46' /* emerald-800 */}}>
      <div className="flex items-center justify-center py-4 px-2">
        <IconLeaf className="w-10 h-10 text-primary-light mr-2" />
        <h1 className="text-2xl font-semibold text-white">
          {t('app.title.smart')} <span className="font-light">{t('app.title.agri')}</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
      <nav className="space-y-2 pt-4 border-t border-emerald-700">
         {settingNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="mt-auto p-2 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} {t('app.footer.solutions')}</p>
      </div>
    </aside>
  );
};

export default Sidebar;