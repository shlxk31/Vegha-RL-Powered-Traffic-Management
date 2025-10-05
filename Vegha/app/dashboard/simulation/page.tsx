// Vegha/app/dashboard/simulation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function SimulationPage() {
  const [sumoUrl, setSumoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Fetch SUMO Web3D endpoint from backend
    fetchSumoEndpoint();
  }, []);

  const fetchSumoEndpoint = async () => {
    try {
      // Replace with your actual backend API endpoint
      const response = await fetch('http://localhost:5000/');
      const data = await response.json();
      
      setSumoUrl(data.url || 'http://localhost:8080');
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching SUMO endpoint:', err);
      // Fallback to default
      setSumoUrl('http://localhost:8080');
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchSumoEndpoint();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SUMO Traffic Simulation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time 3D visualization powered by SUMO Web3D
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* SUMO Web3D Iframe Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading SUMO Web3D...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="text-xl mb-2">⚠️ Error</p>
                <p>{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src="http://localhost:5000/"
              className="w-full h-full border-0"
              title="SUMO Traffic Simulation"
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Connection Info
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Endpoint: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{sumoUrl}</code>
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                Make sure SUMO Web3D server is running on the backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
