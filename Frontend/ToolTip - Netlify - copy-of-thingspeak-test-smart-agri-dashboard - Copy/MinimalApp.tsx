import React from 'react';

const MinimalApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Smart Agriculture Dashboard</h1>
        <p className="text-gray-600">Application is loading successfully!</p>
        <div className="mt-4 flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-green-600">System is operational</span>
        </div>
      </div>
    </div>
  );
};

export default MinimalApp;
