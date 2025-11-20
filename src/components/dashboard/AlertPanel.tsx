// components/monitoring/AlertPanel.tsx
import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  CheckCircle,
  Bell,
  BellOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import type { MonitoringAlert } from '@/lib/types/monitoring';

interface AlertPanelProps {
  alerts: MonitoringAlert[];
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
}

export function AlertPanel({ alerts, onDismiss, onDismissAll }: AlertPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [mutedTypes, setMutedTypes] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(
    alert => !dismissedAlerts.has(alert.id) && !mutedTypes.has(alert.type)
  );

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
    onDismiss?.(alertId);
  };

  const handleDismissAll = () => {
    setDismissedAlerts(new Set(alerts.map(a => a.id)));
    onDismissAll?.();
  };

  const toggleMuteType = (type: string) => {
    setMutedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const alertsByType = visibleAlerts.reduce((acc, alert) => {
    if (!acc[alert.type]) acc[alert.type] = [];
    acc[alert.type].push(alert);
    return acc;
  }, {} as Record<string, MonitoringAlert[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts ({visibleAlerts.length})
          </CardTitle>
          {visibleAlerts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismissAll}
            >
              Dismiss All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p>No active alerts</p>
            <p className="text-sm mt-1">System is running smoothly</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alert Type Filters */}
            <div className="flex gap-2 flex-wrap">
              {['budget', 'performance', 'vendor', 'queue'].map(type => {
                const typeAlerts = alerts.filter(a => a.type === type);
                const isMuted = mutedTypes.has(type);
                
                return (
                  <Button
                    key={type}
                    variant={isMuted ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => toggleMuteType(type)}
                    className="text-xs"
                  >
                    {isMuted ? <BellOff className="h-3 w-3 mr-1" /> : <Bell className="h-3 w-3 mr-1" />}
                    {type} ({typeAlerts.length})
                  </Button>
                );
              })}
            </div>

            {/* Alert List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visibleAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}