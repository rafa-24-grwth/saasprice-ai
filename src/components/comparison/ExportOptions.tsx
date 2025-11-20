// components/comparison/ExportOptions.tsx
// Export functionality component with multiple format support

'use client';

import { useState } from 'react';
import type { ComparisonData, ComparisonExportOptions } from '@/types/comparison';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Alert, AlertDescription } from '@/components/shared/ui/alert';
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Loader2,
  Check,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  data: ComparisonData[];
  onExport: (options: ComparisonExportOptions) => Promise<void>;
}

// Simple Input component if not available
function Input({ 
  id, 
  placeholder, 
  value, 
  onChange, 
  className 
}: { 
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}

// Simple Label component if not available
function Label({ 
  htmlFor, 
  children, 
  className 
}: { 
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
    >
      {children}
    </label>
  );
}

// Simple Checkbox component if not available
function Checkbox({ 
  id, 
  checked, 
  onCheckedChange 
}: { 
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
    />
  );
}

// Simple RadioGroup components if not available
function RadioGroup({ 
  value, 
  onValueChange, 
  children 
}: { 
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2" role="radiogroup">
      {children}
    </div>
  );
}

function RadioGroupItem({ 
  value, 
  id,
  checked,
  onChange
}: { 
  value: string;
  id?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
      className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-2 focus:ring-primary"
    />
  );
}

// Simple Badge component
function Badge({ 
  variant = 'default', 
  className, 
  children 
}: { 
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
          'border border-input': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

// Toast notification function (simple replacement for sonner)
function toast(type: 'success' | 'error', message: string) {
  // Create a simple toast notification
  const toastEl = document.createElement('div');
  toastEl.className = cn(
    'fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg transition-all',
    type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
  );
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toastEl), 300);
  }, 3000);
}

export function ExportOptions({
  isOpen,
  onClose,
  data,
  onExport
}: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [includeFeatures, setIncludeFeatures] = useState(true);
  const [includePricing, setIncludePricing] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);

  const defaultFilename = `comparison-${new Date().toISOString().split('T')[0]}`;

  const formatDescriptions = {
    csv: 'Spreadsheet format compatible with Excel, Google Sheets, and other applications',
    pdf: 'Professional document format ideal for sharing and printing',
    json: 'Machine-readable format for developers and data analysis'
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    pdf: FileText,
    json: FileJson
  };

  const generatePreview = () => {
    if (selectedFormat === 'json') {
      const sampleData = {
        vendors: data.slice(0, 2).map(d => ({
          name: d.vendor.name,
          category: d.vendor.category,
          ...(includePricing && {
            pricing: d.prices.slice(0, 1).map(p => ({
              price: p.base_price,
              cadence: p.cadence
            }))
          }),
          ...(includeFeatures && {
            features: d.features.slice(0, 3).map(f => f.feature)
          })
        })),
        ...(includeMetadata && {
          exported_at: new Date().toISOString(),
          total_vendors: data.length
        })
      };
      setPreviewData(JSON.stringify(sampleData, null, 2));
    } else if (selectedFormat === 'csv') {
      const headers = ['Vendor', 'Category'];
      if (includePricing) headers.push('Starting Price', 'Billing');
      if (includeFeatures) headers.push('Key Features');
      
      const rows = data.slice(0, 3).map(d => {
        const row = [d.vendor.name, d.vendor.category];
        if (includePricing) {
          const price = d.prices[0];
          row.push(
            price ? `$${price.base_price}` : 'Contact Sales',
            price?.cadence || 'N/A'
          );
        }
        if (includeFeatures) {
          row.push(d.features.slice(0, 3).map(f => f.feature).join(', '));
        }
        return row.join(',');
      });
      
      setPreviewData([headers.join(','), ...rows].join('\n'));
    } else {
      setPreviewData('PDF preview not available');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ComparisonExportOptions = {
        format: selectedFormat,
        includeFeatures,
        includePricing,
        includeMetadata,
        filename: filename || defaultFilename
      };

      await onExport(options);
      toast('success', `Successfully exported as ${selectedFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast('error', 'Failed to export comparison data');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedSize = () => {
    let baseSize = data.length * 2; // KB per vendor
    if (includeFeatures) baseSize += data.length * 3;
    if (includePricing) baseSize += data.length * 1;
    if (includeMetadata) baseSize += 1;
    
    const multipliers = { csv: 1, json: 1.5, pdf: 2 };
    const estimatedKB = baseSize * multipliers[selectedFormat];
    
    if (estimatedKB < 1024) {
      return `${estimatedKB.toFixed(0)} KB`;
    }
    return `${(estimatedKB / 1024).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Comparison</DialogTitle>
          <DialogDescription>
            Choose your export format and customize what data to include
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as any)}>
              {(['csv', 'pdf', 'json'] as const).map(format => {
                const Icon = formatIcons[format];
                return (
                  <div key={format} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={format} 
                      id={format}
                      checked={selectedFormat === format}
                      onChange={(v: string) => setSelectedFormat(v as 'csv' | 'pdf' | 'json')}
                    />
                    <Label
                      htmlFor={format}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium uppercase">{format}</span>
                        {format === 'pdf' && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDescriptions[format]}
                      </p>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pricing"
                  checked={includePricing}
                  onCheckedChange={(checked: boolean) => setIncludePricing(checked)}
                />
                <Label htmlFor="pricing" className="cursor-pointer">
                  Pricing Information
                  <span className="text-muted-foreground ml-2">
                    (plans, prices, billing options)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="features"
                  checked={includeFeatures}
                  onCheckedChange={(checked: boolean) => setIncludeFeatures(checked)}
                />
                <Label htmlFor="features" className="cursor-pointer">
                  Feature Comparison
                  <span className="text-muted-foreground ml-2">
                    (all compared features)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked: boolean) => setIncludeMetadata(checked)}
                />
                <Label htmlFor="metadata" className="cursor-pointer">
                  Export Metadata
                  <span className="text-muted-foreground ml-2">
                    (timestamp, version, settings)
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename (optional)</Label>
            <Input
              id="filename"
              placeholder={defaultFilename}
              value={filename}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default naming
            </p>
          </div>

          {/* Preview */}
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="preview" onClick={generatePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="space-y-2">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>Comparing {data.length} vendors</div>
                    <div>Estimated file size: {getEstimatedSize()}</div>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="preview">
              {previewData ? (
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-xs overflow-auto max-h-[200px]">
                    {previewData}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <EyeOff className="h-4 w-4 mr-2" />
                  No preview available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}