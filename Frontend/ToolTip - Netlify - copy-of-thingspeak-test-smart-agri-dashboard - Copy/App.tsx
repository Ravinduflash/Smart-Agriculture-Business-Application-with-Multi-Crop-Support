import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import CropManagementPage from './pages/CropManagementPage';
import IoTSensorsPage from './pages/IoTSensorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import MLModelsPage from './pages/MLModelsPage';
import SmartHelpDesk_Trained from './components/SmartHelpDesk_Trained';
import TrainingManager from './components/TrainingManager';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTrainingManager, setShowTrainingManager] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-2 sm:p-4 lg:p-6 min-h-0">
          <div className="max-w-full mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/crop-management" element={<CropManagementPage />} />
              <Route path="/iot-sensors" element={<IoTSensorsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/ml-models" element={<MLModelsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
      
      {/* Smart Help Desk - Global floating chatbot */}
      <SmartHelpDesk_Trained />
      
      {/* Training Manager Modal */}
      {showTrainingManager && (
        <TrainingManager onClose={() => setShowTrainingManager(false)} />
      )}
      
      {/* Admin Training Access - Press Ctrl+Shift+T */}
      <div 
        className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 z-40"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            setShowTrainingManager(true);
          }
        }}
        tabIndex={0}
      >
        <button
          onClick={() => setShowTrainingManager(true)}
          className="bg-purple-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm hover:bg-purple-600 transition-colors shadow-lg flex items-center gap-1"
          title="Train Chatbot (Ctrl+Shift+T)"
        >
          <span className="text-xs sm:text-sm">🧠</span>
          <span className="hidden xs:inline sm:inline">Train Bot</span>
          <span className="xs:hidden sm:hidden">🧠</span>
        </button>
      </div>
    </div>
  );
};

export default App;
