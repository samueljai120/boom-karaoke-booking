import React from 'react';

const DebugPage = () => {
  console.log('DebugPage is rendering!');
  
  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          🚨 DEBUG PAGE 🚨
        </h1>
        <p className="text-xl text-gray-700 mb-4">
          If you can see this, React is working!
        </p>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">
            Server is running and React components are rendering.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
