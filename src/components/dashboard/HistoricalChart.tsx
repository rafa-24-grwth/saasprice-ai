// components/monitoring/HistoricalChart.tsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shared/ui/select';
import { TrendingUp, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';

interface HistoricalChartProps {
  performanceData?: any;
  timeRange?: '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d') => void;
}

export function HistoricalChart({ 
  performanceData, 
  timeRange = '7d',
  onTimeRangeChange 
}: HistoricalChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Mock data for demonstration - replace with real data from API
  const mockData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      jobs: Math.floor(Math.random() * 100) + 50,
      successRate: Math.floor(Math.random() * 20) + 75,
      cost: parseFloat((Math.random() * 2 + 1).toFixed(2)),
    };
  });

  const data = performanceData || mockData;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Performance
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(v) => onTimeRangeChange?.(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="success">Success Rate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="Jobs"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#82ca9d"
                  name="Success Rate %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="jobs">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="costs">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#ffc658" 
                  fill="#ffc658"
                  fillOpacity={0.6}
                  name="Daily Cost ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="success">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Success Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}