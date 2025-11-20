// app/(protected)/dashboard/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  DollarSign,
  Package2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Eye,
  AlertCircle,
  Building2,
  GitCompare,
  Minus
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

export default function Dashboard() {
  const { data, loading, error } = useDashboard({ period: '30d' });

  const stats = [
    {
      title: 'Total Vendors',
      value: data?.metrics?.totalVendors || 127,
      change: 12,
      changeType: 'increase',
      icon: Building2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      changeColor: 'text-green-600'
    },
    {
      title: 'Comparisons',
      value: data?.metrics?.comparisonsThisWeek || 43,
      change: 23,
      changeType: 'increase',
      icon: GitCompare,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      changeColor: 'text-green-600'
    },
    {
      title: 'Avg. Savings',
      value: `$${data?.metrics?.averageSavings?.toLocaleString() || '2,847'}`,
      change: 8,
      changeType: 'increase',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600'
    }
  ];

  const recentActivity = [
    { 
      title: 'Slack pricing updated', 
      time: '2 hours ago', 
      dotColor: 'bg-green-500'
    },
    { 
      title: 'New comparison: Notion vs Coda', 
      time: '5 hours ago', 
      dotColor: 'bg-blue-500'
    },
    { 
      title: 'Figma added to watchlist', 
      time: 'Yesterday', 
      dotColor: 'bg-yellow-500'
    },
    { 
      title: 'Microsoft Teams price increase', 
      time: '2 days ago', 
      dotColor: 'bg-red-500'
    }
  ];

  const watchedVendors = [
    { 
      name: 'Slack', 
      confidence: 95, 
      trend: 'up',
      bgColor: 'bg-purple-600',
      initial: 'S'
    },
    { 
      name: 'Notion', 
      confidence: 88, 
      trend: 'stable',
      bgColor: 'bg-gray-800',
      initial: 'N'
    },
    { 
      name: 'Figma', 
      confidence: 92, 
      trend: 'down',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      initial: 'F'
    },
    { 
      name: 'Linear', 
      confidence: 78, 
      trend: 'up',
      bgColor: 'bg-blue-600',
      initial: 'L'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your SaaS spending and vendor intelligence
              </p>
            </div>
            <select className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-600">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 24 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center text-sm font-semibold ${stat.changeColor}`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}%
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart and Activity Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${activity.dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Watched Vendors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Watched Vendors</h2>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {watchedVendors.map((vendor, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${vendor.bgColor} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {vendor.initial}
                  </div>
                  {vendor.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : vendor.trend === 'down' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{vendor.name}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${vendor.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{vendor.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/compare'}
            className="px-6 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <GitCompare className="w-5 h-5" />
            Try a Comparison
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Package2 className="w-5 h-5" />
            Export Data
          </motion.button>
        </div>
      </div>
    </div>
  );
}