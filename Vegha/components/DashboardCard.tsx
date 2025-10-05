import { Suspense } from 'react'
import { 
  Activity, 
  MapPin, 
  Car, 
  Truck, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  BarChart3
} from 'lucide-react'
import { getDashboard, formatWaitTime, getCongestionColor, getAlertColor } from '@/lib/api'

// Enhanced Loading component
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
      </div>

      {/* System Status Skeleton with shimmer effect */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-48 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Dashboard Component
async function DashboardContent() {
  const data = await getDashboard()

  const getStatusIcon = () => {
    switch (data.system_status) {
      case 'operational':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />
      case 'critical':
        return <XCircle className="w-8 h-8 text-red-500" />
      default:
        return <Activity className="w-8 h-8 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (data.system_status) {
      case 'operational':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBg = () => {
    switch (data.system_status) {
      case 'operational':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
      case 'warning':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
      case 'critical':
        return 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-200 dark:border-gray-700'
    }
  }

  // Calculate operational percentage
  const operationalPercentage = Math.round((data.traffic_overview.active_junctions / data.traffic_overview.total_junctions) * 100)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Enhanced System Status Card */}
      <div className={`rounded-xl border p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${getStatusBg()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {getStatusIcon()}
              {data.system_status === 'operational' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">System Status</h2>
              <p className={`text-3xl font-bold capitalize ${getStatusColor()}`}>
                {data.system_status}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date().toLocaleTimeString('en-IN', { hour12: true })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{operationalPercentage}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Operational</div>
            <div className="flex items-center justify-end mt-1">
              {operationalPercentage > 90 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className="text-xs text-gray-500">vs yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Junctions Card */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Junctions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.traffic_overview.total_junctions}
              </p>
              <div className="flex items-center mt-2">
                <Eye className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Monitoring all</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Junctions Card */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Junctions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.traffic_overview.active_junctions}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {operationalPercentage}% operational
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-shadow duration-300">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Average Congestion Card */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Congestion</p>
              <p className={`text-3xl font-bold capitalize mt-2 ${getCongestionColor(data.traffic_overview.average_congestion)}`}>
                {data.traffic_overview.average_congestion}
              </p>
              <div className="flex items-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  data.traffic_overview.average_congestion === 'light' ? 'bg-green-500' :
                  data.traffic_overview.average_congestion === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">City-wide average</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-shadow duration-300">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Vehicles Card */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.current_metrics.total_vehicles.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">+5.2% vs yesterday</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-300">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Vehicles Card */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emergency Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.current_metrics.emergency_vehicles}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-red-600 dark:text-red-400">Active responses</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-shadow duration-300">
                <Truck className="w-8 h-8 text-white" />
              </div>
              {data.current_metrics.emergency_vehicles > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    {data.current_metrics.emergency_vehicles}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Events Card */}
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data.current_metrics.active_events}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Ongoing incidents</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Wait Time Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Average Wait Time</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                {formatWaitTime(data.current_metrics.average_wait_time_sec)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Across all monitored junctions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {Math.round(data.current_metrics.average_wait_time_sec / 60 * 10) / 10} min
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Per vehicle</div>
          </div>
        </div>
      </div>

      {/* Enhanced Alerts Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Alerts</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live updates</span>
          </div>
        </div>
        <div className="space-y-4">
          {data.alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No active alerts</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">All systems operating normally</p>
            </div>
          ) : (
            data.alerts.map((alert, index) => (
  <div
    key={index}
    className={`p-6 rounded-xl border ${getAlertColor(alert.type)} hover:scale-[1.02] transition-transform duration-200`}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        {alert.type === 'critical' && <XCircle className="w-6 h-6 text-red-600 dark:text-red-300" />}
        {alert.type === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />}
        {alert.type === 'info' && <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-300" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold capitalize text-sm tracking-wide">{alert.type} Alert</span>
          <span className="text-xs opacity-75">{new Date().toLocaleTimeString('en-IN', { hour12: true })}</span>
        </div>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">{alert.message}</p>
      </div>
    </div>
  </div>
))
          )}
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Traffic Management Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring and analytics for your traffic management system
          </p>
        </div>
        
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />  
        </Suspense>
      </div>
    </div>
  )
}