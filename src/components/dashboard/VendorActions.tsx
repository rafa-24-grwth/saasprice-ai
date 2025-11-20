// components/monitoring/VendorActions.tsx
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw,
  Settings,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select';
import { Label } from '@/components/shared/ui/label';
import { Switch } from '@/components/shared/ui/switch';
import type { VendorHealth } from '@/lib/types/monitoring';

interface VendorActionsProps {
  vendor: VendorHealth;
  onScrape?: (vendorId: string) => Promise<void>;
  onToggleEnabled?: (vendorId: string, enabled: boolean) => Promise<void>;
  onUpdateFrequency?: (vendorId: string, frequency: string) => Promise<void>;
}

export function VendorActions({ 
  vendor, 
  onScrape, 
  onToggleEnabled,
  onUpdateFrequency 
}: VendorActionsProps) {
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [enabled, setEnabled] = useState(vendor.health !== 'unknown');
  const [frequency, setFrequency] = useState('daily');

  const handleScrape = async () => {
    setLoading(true);
    try {
      await onScrape?.(vendor.id);
    } catch (error) {
      console.error('Failed to scrape vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (checked: boolean) => {
    setEnabled(checked);
    try {
      await onToggleEnabled?.(vendor.id, checked);
    } catch (error) {
      console.error('Failed to toggle vendor:', error);
      setEnabled(!checked); // Revert on error
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      await onUpdateFrequency?.(vendor.id, frequency);
      setSettingsOpen(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleScrape}
          disabled={loading}
          title="Scrape Now"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vendor Settings</DialogTitle>
            <DialogDescription>
              Configure scraping settings for {vendor.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Status Info */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className={`capitalize ${
                    vendor.health === 'healthy' ? 'text-green-600' :
                    vendor.health === 'warning' ? 'text-yellow-600' :
                    vendor.health === 'error' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {vendor.health}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{vendor.hoursSinceLastScrape}h ago</span>
                </div>
              </div>
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Automatic Scraping</Label>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={handleToggleEnabled}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Scraping Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Next Scheduled */}
            {vendor.nextScheduled && (
              <div className="space-y-2">
                <Label>Next Scheduled Scrape</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(vendor.nextScheduled).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}