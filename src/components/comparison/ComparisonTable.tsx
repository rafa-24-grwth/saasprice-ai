// components/comparison/ComparisonTable.tsx
// Detailed comparison table component with feature matrix

'use client';

import { useState, useMemo } from 'react';
import type { ComparisonData } from '@/types/comparison';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shared/ui/tooltip';
import { 
  Check, 
  X, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  DollarSign,
  Package,
  Users,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonTableProps {
  data: ComparisonData[];
  highlightBest?: boolean;
  showConfidence?: boolean;
  compactMode?: boolean;
}

export function ComparisonTable({
  data,
  highlightBest = true,
  showConfidence = true,
  compactMode = false
}: ComparisonTableProps) {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['pricing', 'features'])
  );

  // Extract unique tiers and categories
  const tiers = useMemo(() => {
    const tiersSet = new Set<string>();
    data.forEach(item => {
      item.plans.forEach(plan => tiersSet.add(plan.tier));
    });
    return Array.from(tiersSet);
  }, [data]);

  const featureCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    data.forEach(item => {
      item.features.forEach(feature => {
        if (feature.category) categoriesSet.add(feature.category);
      });
    });
    return Array.from(categoriesSet);
  }, [data]);

  // Filter plans based on selected tier
  const filteredData = useMemo(() => {
    return data.map(item => ({
      ...item,
      plans: selectedTier === 'all' 
        ? item.plans 
        : item.plans.filter(plan => plan.tier === selectedTier),
      features: selectedCategory === 'all'
        ? item.features
        : item.features.filter(f => f.category === selectedCategory)
    }));
  }, [data, selectedTier, selectedCategory]);

  // Build feature matrix
  const featureMatrix = useMemo(() => {
    const allFeatures = new Set<string>();
    const matrix: Record<string, Record<string, any>> = {};

    filteredData.forEach(item => {
      item.features.forEach(feature => {
        allFeatures.add(feature.feature);
        if (!matrix[feature.feature]) {
          matrix[feature.feature] = {};
        }
        matrix[feature.feature][item.vendor.id] = feature;
      });
    });

    return {
      features: Array.from(allFeatures).sort(),
      data: matrix
    };
  }, [filteredData]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security': return Shield;
      case 'performance': return Zap;
      case 'collaboration': return Users;
      case 'integration': return Globe;
      case 'support': return Package;
      default: return Info;
    }
  };

  const getPriceBadgeColor = (price: number | null, allPrices: number[]) => {
    if (!price || allPrices.length === 0) return 'default';
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    
    if (price === min) return 'success';
    if (price === max) return 'destructive';
    return 'secondary';
  };

  const formatPrice = (price: number | null, cadence: string) => {
    if (!price) return 'Contact Sales';
    
    const formatted = `$${price.toFixed(2)}`;
    switch (cadence) {
      case 'monthly': return `${formatted}/mo`;
      case 'yearly': return `${formatted}/yr`;
      case 'one-time': return formatted;
      default: return formatted;
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No vendors selected for comparison
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {tiers.map(tier => (
              <SelectItem key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Feature category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Features</SelectItem>
            {featureCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedSections(new Set(['pricing', 'features', 'details']))}
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedSections(new Set())}
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-card rounded-lg">
          {/* Header */}
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 bg-card p-4 text-left font-semibold">
                <span className="text-sm text-muted-foreground">Compare</span>
              </th>
              {filteredData.map(item => (
                <th key={item.vendor.id} className="p-4 text-center min-w-[200px]">
                  <div className="space-y-2">
                    {item.vendor.logo_url ? (
                      <img
                        src={item.vendor.logo_url}
                        alt={item.vendor.name}
                        className="h-12 w-12 mx-auto rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 mx-auto rounded bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{item.vendor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.vendor.category}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Pricing Section */}
            <tr className="border-b bg-muted/30">
              <td colSpan={data.length + 1} className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleSection('pricing')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Information
                  {expandedSections.has('pricing') ? (
                    <Minus className="h-4 w-4 ml-auto" />
                  ) : (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              </td>
            </tr>

            {expandedSections.has('pricing') && (
              <>
                <tr className="border-b">
                  <td className="sticky left-0 bg-card p-4 font-medium">
                    Starting Price
                  </td>
                  {filteredData.map(item => {
                    const lowestPrice = item.prices
                      .filter(p => p.normalized_monthly_price)
                      .sort((a, b) => 
                        (a.normalized_monthly_price || 0) - (b.normalized_monthly_price || 0)
                      )[0];
                    
                    const allPrices = filteredData
                      .flatMap(d => d.prices)
                      .map(p => p.normalized_monthly_price)
                      .filter(Boolean) as number[];

                    return (
                      <td key={item.vendor.id} className="p-4 text-center">
                        {lowestPrice ? (
                          <div className="space-y-1">
                            <Badge variant={
                              highlightBest 
                                ? getPriceBadgeColor(lowestPrice.normalized_monthly_price, allPrices) as any
                                : 'secondary'
                            }>
                              ${lowestPrice.normalized_monthly_price?.toFixed(2)}/mo
                            </Badge>
                            {showConfidence && (
                              <div className="text-xs text-muted-foreground">
                                {Math.round(lowestPrice.confidence_score)}% confidence
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Contact Sales</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b">
                  <td className="sticky left-0 bg-card p-4 font-medium">
                    Available Plans
                  </td>
                  {filteredData.map(item => (
                    <td key={item.vendor.id} className="p-4 text-center">
                      <div className="space-y-2">
                        {item.plans.map(plan => (
                          <div key={plan.id} className="text-sm">
                            <Badge variant="outline" className="capitalize">
                              {plan.tier}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b">
                  <td className="sticky left-0 bg-card p-4 font-medium">
                    Billing Options
                  </td>
                  {filteredData.map(item => {
                    const billingOptions = Array.from(
                      new Set(item.prices.map(p => p.cadence))
                    );
                    return (
                      <td key={item.vendor.id} className="p-4 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {billingOptions.map(option => (
                            <Badge key={option} variant="secondary" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {/* Features Section */}
            <tr className="border-b bg-muted/30">
              <td colSpan={data.length + 1} className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => toggleSection('features')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Features Comparison
                  {expandedSections.has('features') ? (
                    <Minus className="h-4 w-4 ml-auto" />
                  ) : (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              </td>
            </tr>

            {expandedSections.has('features') && featureMatrix.features.map(feature => (
              <tr key={feature} className="border-b hover:bg-muted/20 transition-colors">
                <td className="sticky left-0 bg-card p-4 font-medium">
                  <div className="flex items-center gap-2">
                    <span>{feature}</span>
                  </div>
                </td>
                {filteredData.map(item => {
                  const featureData = featureMatrix.data[feature]?.[item.vendor.id];
                  return (
                    <td key={item.vendor.id} className="p-4 text-center">
                      {featureData ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center justify-center">
                                {featureData.included ? (
                                  <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                  <X className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                            </TooltipTrigger>
                            {featureData.limit && (
                              <TooltipContent>
                                <p>{featureData.limit}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}