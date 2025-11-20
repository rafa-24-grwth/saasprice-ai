// app/monitoring/page.tsx
'use client';

import { useState } from 'react';
import { 
  useMonitoringStats,
  calculateSystemHealth,
  generateAlerts,
  DEFAULT_THRESHOLDS
} from '@/lib/monitoring';

// Force dynamic rendering to avoid build-time Supabase client initialization
export const dynamic = 'force-dynamic';
import { 
  StatCard, 
  StatusBadge, 
  ProgressBar, 
  HealthIndicator,
  ActivityTimeline,
  MethodUsageChart,
  MetricList,
  LoadingSpinner,
  EmptyState
} from '@/components/dashboard';
// Import new components
import { ExportButton } from '@/components/dashboard/ExportButton';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { JobActions } from '@/components/dashboard/JobActions';
import { VendorActions } from '@/components/dashboard/VendorActions';
import { HistoricalChart } from '@/components/dashboard/HistoricalChart';
import { 
  RefreshCw, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Alert, AlertDescription } from '@/components/shared/ui/alert';

export default function MonitoringDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Fix: Change timeRange type to match what HistoricalChart expects
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Use the monitoring hook from the centralized monitoring module
  const { data: stats, loading, error, refresh, lastUpdated: lastRefresh } = useMonitoringStats({
    refreshInterval: 30000, // 30 seconds
    enabled: autoRefresh,
  });

  // Calculate overall system health using utility function
  const systemHealth = stats ? calculateSystemHealth(stats, DEFAULT_THRESHOLDS) : 'unknown';

  // Generate alerts based on current stats and filter dismissed ones
  const alerts = stats 
    ? generateAlerts(stats, DEFAULT_THRESHOLDS).filter((alert: any) => !dismissedAlerts.has(alert.id))
    : [];

  // Add missing handler functions
  const handleScrapeVendor = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/scrape`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to trigger scrape');
      refresh(); // Refresh stats after action
    } catch (error) {
      console.error('Failed to scrape vendor:', error);
    }
  };

  const handleUpdateVendorSettings = async (vendorId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: enabled }),
      });
      if (!response.ok) throw new Error('Failed to update vendor settings');
      refresh(); // Refresh stats after action
    } catch (error) {
      console.error('Failed to update vendor:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading monitoring dashboard..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load monitoring data"
          description={error}
          action={{
            label: 'Retry',
            onClick: refresh
          }}
        />
      </div>
    );
  }

  if (!stats) return null;

  // Use timeline data directly - ActivityTimeline expects hour as string
  const timelineData = stats.performance.last24Hours.timeline;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Real-time system metrics and health status
            </p>
          </div>
          <HealthIndicator 
            health={systemHealth} 
            size="lg" 
            showLabel 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          
          <ExportButton data={stats} />
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mb-4 text-sm text-gray-600">
        Last updated: {lastRefresh?.toLocaleString() || 'Never'}
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Queue Status */}
        <StatCard
          title="Job Queue"
          value={`${stats.queue.total_jobs} total`}
          icon={Activity}
          iconColor="text-blue-600"
        >
          <div className="mt-3 space-y-1">
            <MetricList
              items={[
                { label: 'Pending', value: stats.queue.pending_jobs.toString(), color: 'text-blue-600' },
                { label: 'Processing', value: stats.queue.processing_jobs.toString(), color: 'text-yellow-600' },
                { label: 'Completed', value: stats.queue.completed_jobs.toString(), color: 'text-green-600' },
                { label: 'Failed', value: stats.queue.failed_jobs.toString(), color: 'text-red-600' }
              ]}
              orientation="vertical"
            />
          </div>
        </StatCard>

        {/* Budget Status */}
        <StatCard
          title="Daily Budget"
          value={`$${stats.budget.remaining.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-green-600"
        >
          <div className="mt-3">
            <ProgressBar
              value={stats.budget.spent}
              max={stats.budget.dailyLimit}
              label={`Spent: $${stats.budget.spent.toFixed(2)}`}
              showPercentage
              colorThresholds={{ warning: 70, danger: 90 }}
            />
            <p className="text-xs text-gray-600 mt-2">
              Limit: ${stats.budget.dailyLimit.toFixed(2)}/day
            </p>
          </div>
        </StatCard>

        {/* Success Rate */}
        <StatCard
          title="Success Rate (7d)"
          value={`${stats.performance.last7Days.successRate}%`}
          icon={TrendingUp}
          iconColor="text-purple-600"
        >
          <div className="mt-3">
            <MetricList
              items={[
                { label: 'Total Jobs', value: stats.performance.last7Days.totalJobs.toString() },
                { label: 'Total Cost', value: `$${stats.performance.last7Days.totalCost.toFixed(2)}` }
              ]}
              orientation="vertical"
            />
          </div>
        </StatCard>

        {/* Vendor Health */}
        <StatCard
          title="Vendor Health"
          value={`${stats.vendors.total} vendors`}
          icon={Users}
          iconColor="text-orange-600"
        >
          <div className="mt-3">
            <MetricList
              items={[
                { label: 'Healthy', value: stats.vendors.healthy.toString(), color: 'text-green-600' },
                { label: 'Warning', value: stats.vendors.warning.toString(), color: 'text-yellow-600' },
                { label: 'Error', value: stats.vendors.error.toString(), color: 'text-red-600' },
                { label: 'Critical', value: stats.vendors.critical.toString(), color: 'text-red-800' }
              ]}
              orientation="vertical"
            />
          </div>
        </StatCard>
      </div>

      {/* Historical Performance Chart */}
      <HistoricalChart 
        timeRange={timeRange}
        onTimeRangeChange={(range) => setTimeRange(range as '7d' | '30d' | '90d')}
      />

      {/* Alert Management Panel */}
      <AlertPanel 
        alerts={alerts}
        onDismiss={(id) => setDismissedAlerts(prev => new Set(prev).add(id))}
        onDismissAll={() => setDismissedAlerts(new Set(alerts.map((a: any) => a.id)))}
      />

      {/* Method Usage and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Method Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Scraping Method Usage (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MethodUsageChart
              methodUsage={stats.performance.last7Days.methodUsage}
              costByMethod={stats.performance.last7Days.costByMethod}
              totalJobs={stats.performance.last7Days.totalJobs}
            />
          </CardContent>
        </Card>

        {/* 24-Hour Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              24-Hour Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <>
                <ActivityTimeline data={timelineData} height={160} />
                <p className="text-xs text-center text-gray-600 mt-2">
                  Total: {stats.performance.last24Hours.totalJobs} jobs
                </p>
              </>
            ) : (
              <EmptyState
                title="No activity data"
                description="Activity will appear once jobs are processed"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Status and Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Status List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.vendors.list.map((vendor: any) => (
                <div 
                  key={vendor.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <HealthIndicator 
                      health={vendor.health as any} 
                      size="sm" 
                      showLabel={false}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-xs text-gray-600">
                        {vendor.lastScraped 
                          ? `Last: ${vendor.hoursSinceLastScrape?.toFixed(0)}h ago`
                          : 'Never scraped'}
                      </div>
                    </div>
                    <StatusBadge status={vendor.health} size="sm" />
                  </div>
                  <VendorActions 
                    vendor={vendor}
                    onScrape={handleScrapeVendor}
                    onToggleEnabled={handleUpdateVendorSettings}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job: any) => (
                  <div 
                    key={job.id}
                    className="p-3 rounded-lg hover:bg-gray-50 border"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">
                        {job.vendorName || 'Unknown Vendor'}
                      </div>
                      <StatusBadge status={job.status} size="sm" />
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatDate(job.createdAt)}
                      {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleTimeString()}`}
                    </div>
                    {job.error && (
                      <div className="text-xs text-red-600 mt-1 truncate">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No recent jobs"
                  description="Jobs will appear here once scraping begins"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for failed jobs or critical alerts */}
      {alerts.length > 0 && (
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{alerts.filter((a: any) => a.severity === 'critical').length} critical alerts</strong>
            {alerts[0] && ` - ${alerts[0].message}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}