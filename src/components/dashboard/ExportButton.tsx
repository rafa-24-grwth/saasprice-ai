// components/monitoring/ExportButton.tsx
import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shared/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shared/ui/popover';
import { formatStatsForExport } from '@/lib/monitoring/utils';
import type { MonitoringStats } from '@/lib/types/monitoring';

interface ExportButtonProps {
  data: MonitoringStats | null;
  className?: string;
}

export function ExportButton({ data, className }: ExportButtonProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data) return;
    
    setIsExporting(true);
    try {
      const exportData = formatStatsForExport(data, format);
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoring-stats-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={!data}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Export Settings</h4>
            <p className="text-sm text-muted-foreground">
              Download monitoring data in your preferred format
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={format} onValueChange={(v) => setFormat(v as 'json' | 'csv')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                <SelectItem value="json">JSON (Raw data)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleExport} 
            className="w-full"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Download'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}