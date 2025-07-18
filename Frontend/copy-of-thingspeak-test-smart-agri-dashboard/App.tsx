
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import CropManagementPage from './pages/CropManagementPage';
import IoTSensorsPage from './pages/IoTSensorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import MLModelsPage from './pages/MLModelsPage'; // Import the new page

const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/crop-management" element={<CropManagementPage />} />
            <Route path="/iot-sensors" element={<IoTSensorsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ml-models" element={<MLModelsPage />} /> {/* Add new route */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;
