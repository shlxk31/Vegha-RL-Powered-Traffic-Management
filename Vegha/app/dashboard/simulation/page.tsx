// Vegha/app/dashboard/simulation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Card from '@/components/Card';
import { 
  Activity, 
  Car, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  TrafficCone, 
  Timer, 
  MapPin, 
  AlertTriangle,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface SimulationMetrics {
  vehicleCount: number;
  avgSpeed: number;
  waiting: number;
  simTime: number;
  signals: number;
  avgWaitTime: number;
  congestionPercent: number;
}

export default function SimulationPage() {
  const [sumoUrl, setSumoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    vehicleCount: 0,
    avgSpeed: 0,
    waiting: 0,
    simTime: 0,
    signals: 12,
    avgWaitTime: 0.0,
    congestionPercent: 0
  });

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('Connected to SUMO backend via Socket.IO');
      setIsConnected(true);
      setIsLoading(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from SUMO backend');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      setError('Failed to connect to simulation server');
    });

    // Listen for simulation updates
    socketInstance.on('update', (data: any) => {
      setMetrics({
        vehicleCount: Object.keys(data.vehicles || {}).length,
        avgSpeed: data.avg_speed || 0,
        waiting: data.waiting || 0,
        simTime: data.time || 0,
        signals: Object.keys(data.traffic_lights || {}).length,
        avgWaitTime: data.avg_wait_time || 0.0,
        congestionPercent: data.congestion_percent || 0
      });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchSumoEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:5000/');
      const data = await response.json();
      setSumoUrl(data.url || 'http://localhost:5000');
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching SUMO endpoint:', err);
      setSumoUrl('http://localhost:5000');
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Vegha Traffic Simulation
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
              Real-time SUMO traffic simulation with live metrics
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {/* SUMO Simulation Iframe Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl overflow-hidden mb-6 h-[calc(100vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">
                  Loading SUMO Simulation...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-500">
                <p className="text-2xl mb-2">⚠️ Error</p>
                <p className="text-gray-400">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

        {/* Simulation Statistics Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Simulation Statistics
          </h2>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
          <Card
            title="Simulation Step"
            value={metrics.simTime}
            icon={Activity}
            iconBgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle="Current simulation step"
            status={{
              text: isConnected ? 'Live' : 'Disconnected',
              color: isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
              dotColor: isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }}
          />
          
          <Card
            title="Total Vehicles"
            value={metrics.vehicleCount}
            icon={Car}
            iconBgColor="bg-gradient-to-br from-purple-500 to-indigo-600"
            subtitle="Active vehicles in simulation"
            status={{
              text: isConnected ? 'Live count' : 'Static',
              color: isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
              dotColor: isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }}
          />
          
          <Card
            title="Waiting Vehicles"
            value={metrics.waiting}
            icon={TrafficCone}
            iconBgColor="bg-gradient-to-br from-orange-500 to-red-500"
            subtitle="Vehicles waiting at signals"
            status={{
              text: isConnected ? 'Real-time' : 'Calculated',
              color: isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
              dotColor: isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }}
          />
          
          <Card
            title="Average Speed"
            value={`${metrics.avgSpeed.toFixed(1)} km/h`}
            icon={Clock}
            iconBgColor="bg-gradient-to-br from-green-500 to-emerald-600"
            subtitle="Mean vehicle speed"
            status={{
              text: isConnected ? 'Real-time' : 'Calculated',
              color: isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
              dotColor: isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }}
          />
          
          <Card
            title="Total Signals"
            value={metrics.signals}
            icon={MapPin}
            iconBgColor="bg-gradient-to-br from-cyan-500 to-blue-500"
            subtitle="Traffic signals in network"
            status={{
              text: 'Network total',
              color: 'text-gray-500 dark:text-gray-400',
              dotColor: 'bg-gray-500'
            }}
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">




        </div>

        {/* Connection Info Panel */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              ℹ️
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-100 mb-2 text-lg">
                Connection Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-300">Endpoint:</span>
                  <code className="bg-blue-900/50 px-3 py-1 rounded text-blue-200 text-sm font-mono">
                    http://localhost:5000
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-300">Status:</span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    isConnected 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {isConnected ? '● Connected' : '● Disconnected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-300">Protocol:</span>
                  <span className="text-blue-200 text-sm">Socket.IO • Real-time updates enabled</span>
                </div>
              </div>
              <p className="text-sm text-blue-400 mt-3">
                Make sure SUMO Web3D server is running on the backend. Metrics update in real-time via WebSocket connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
