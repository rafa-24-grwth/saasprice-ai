// lib/utils/comparison-export.ts
// Export utility functions for generating CSV, PDF, and JSON files

import type { ComparisonData, ComparisonExportOptions } from '@/types/comparison';

/**
 * Convert comparison data to CSV format
 */
export function generateCSV(data: ComparisonData[], options: ComparisonExportOptions): string {
  const rows: string[][] = [];
  
  // Build header row
  const headers = ['Vendor', 'Category', 'Website'];
  
  if (options.includePricing) {
    headers.push('Plan', 'Tier', 'Price', 'Billing', 'Currency', 'Confidence');
  }
  
  if (options.includeFeatures) {
    // Get all unique features
    const allFeatures = new Set<string>();
    data.forEach(item => {
      item.features.forEach(f => allFeatures.add(f.feature));
    });
    const featuresList = Array.from(allFeatures).sort();
    headers.push(...featuresList);
  }
  
  rows.push(headers);
  
  // Build data rows
  data.forEach(item => {
    const vendor = item.vendor;
    
    if (options.includePricing && item.plans.length > 0) {
      // Create a row for each plan
      item.plans.forEach(plan => {
        const row = [
          vendor.name,
          vendor.category,
          vendor.website
        ];
        
        // Find price for this plan
        const price = item.prices.find(p => p.plan_id === plan.id);
        
        row.push(
          plan.name,
          plan.tier,
          price?.base_price?.toString() || 'Contact Sales',
          price?.cadence || 'N/A',
          price?.currency || 'USD',
          price?.confidence_score ? `${Math.round(price.confidence_score)}%` : 'N/A'
        );
        
        if (options.includeFeatures) {
          // Add feature data
          const featuresList = Array.from(new Set(
            data.flatMap(d => d.features.map(f => f.feature))
          )).sort();
          
          featuresList.forEach(featureName => {
            const feature = item.features.find(
              f => f.plan_id === plan.id && f.feature === featureName
            );
            if (feature) {
              row.push(feature.included ? '✓' : '✗');
            } else {
              row.push('-');
            }
          });
        }
        
        rows.push(row);
      });
    } else {
      // Single row per vendor if no pricing included
      const row = [
        vendor.name,
        vendor.category,
        vendor.website
      ];
      
      if (options.includeFeatures) {
        const featuresList = Array.from(new Set(
          data.flatMap(d => d.features.map(f => f.feature))
        )).sort();
        
        featuresList.forEach(featureName => {
          const feature = item.features.find(f => f.feature === featureName);
          row.push(feature?.included ? '✓' : '-');
        });
      }
      
      rows.push(row);
    }
  });
  
  // Add metadata if requested
  if (options.includeMetadata) {
    rows.push([]);
    rows.push(['Export Metadata']);
    rows.push(['Generated At', new Date().toISOString()]);
    rows.push(['Total Vendors', data.length.toString()]);
    rows.push(['Options', `Pricing: ${options.includePricing}, Features: ${options.includeFeatures}`]);
  }
  
  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or quotes
      const escaped = cell.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
}

/**
 * Convert comparison data to JSON format
 */
export function generateJSON(data: ComparisonData[], options: ComparisonExportOptions): string {
  const output: any = {
    comparison: data.map(item => {
      const vendorData: any = {
        vendor: {
          id: item.vendor.id,
          name: item.vendor.name,
          category: item.vendor.category,
          website: item.vendor.website,
          description: item.vendor.description
        }
      };
      
      if (options.includePricing) {
        vendorData.pricing = {
          plans: item.plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            tier: plan.tier,
            description: plan.description,
            is_active: plan.is_active
          })),
          prices: item.prices.map(price => ({
            plan_id: price.plan_id,
            base_price: price.base_price,
            currency: price.currency,
            cadence: price.cadence,
            unit: price.unit,
            confidence_score: price.confidence_score,
            normalized_monthly_price: price.normalized_monthly_price,
            effective_date: price.effective_date
          }))
        };
      }
      
      if (options.includeFeatures) {
        vendorData.features = item.features.map(feature => ({
          plan_id: feature.plan_id,
          feature: feature.feature,
          included: feature.included,
          limit: feature.limit,
          category: feature.category
        }));
      }
      
      return vendorData;
    })
  };
  
  if (options.includeMetadata) {
    output.metadata = {
      exported_at: new Date().toISOString(),
      total_vendors: data.length,
      export_options: {
        include_pricing: options.includePricing,
        include_features: options.includeFeatures,
        format: options.format
      },
      summary: {
        total_plans: data.reduce((sum, item) => sum + item.plans.length, 0),
        total_features: new Set(data.flatMap(d => d.features.map(f => f.feature))).size,
        price_range: getPriceRange(data)
      }
    };
  }
  
  return JSON.stringify(output, null, 2);
}

/**
 * Convert comparison data to HTML for PDF generation
 */
export function generateHTML(data: ComparisonData[], options: ComparisonExportOptions): string {
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, system-ui, sans-serif; padding: 20px; color: #1a1a1a; }
      h1 { font-size: 24px; margin-bottom: 10px; color: #0f172a; }
      .subtitle { color: #64748b; margin-bottom: 20px; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th, td { padding: 12px; text-align: left; border: 1px solid #e2e8f0; }
      th { background: #f8fafc; font-weight: 600; color: #0f172a; }
      tr:nth-child(even) { background: #f8fafc; }
      .vendor-header { display: flex; align-items: center; gap: 8px; }
      .vendor-name { font-weight: 600; color: #0f172a; }
      .vendor-category { color: #64748b; font-size: 12px; }
      .price { font-weight: 600; color: #059669; }
      .feature-yes { color: #059669; font-weight: 600; }
      .feature-no { color: #dc2626; }
      .feature-na { color: #94a3b8; }
      .metadata { margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; }
      .metadata h2 { font-size: 16px; margin-bottom: 10px; }
      .metadata p { font-size: 14px; color: #64748b; margin-bottom: 5px; }
      @media print { body { padding: 0; } }
    </style>
  `;
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Vendor Comparison Report</title>
      ${styles}
    </head>
    <body>
      <h1>Vendor Comparison Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
  `;
  
  // Vendor Overview Table
  html += `
    <h2 style="margin: 20px 0 10px;">Vendor Overview</h2>
    <table>
      <thead>
        <tr>
          <th>Vendor</th>
          <th>Category</th>
          <th>Website</th>
          ${options.includePricing ? '<th>Starting Price</th>' : ''}
          ${options.includePricing ? '<th>Plans Available</th>' : ''}
        </tr>
      </thead>
      <tbody>
  `;
  
  data.forEach(item => {
    const lowestPrice = item.prices
      .filter(p => p.normalized_monthly_price)
      .sort((a, b) => (a.normalized_monthly_price || 0) - (b.normalized_monthly_price || 0))[0];
    
    html += `
      <tr>
        <td><div class="vendor-name">${escapeHtml(item.vendor.name)}</div></td>
        <td>${escapeHtml(item.vendor.category)}</td>
        <td><a href="${escapeHtml(item.vendor.website)}">${escapeHtml(item.vendor.website)}</a></td>
        ${options.includePricing ? `<td class="price">${
          lowestPrice ? `$${lowestPrice.normalized_monthly_price?.toFixed(2)}/mo` : 'Contact Sales'
        }</td>` : ''}
        ${options.includePricing ? `<td>${item.plans.length} plans</td>` : ''}
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  
  // Feature Comparison Table
  if (options.includeFeatures) {
    const allFeatures = new Set<string>();
    data.forEach(item => {
      item.features.forEach(f => allFeatures.add(f.feature));
    });
    const featuresList = Array.from(allFeatures).sort();
    
    html += `
      <h2 style="margin: 20px 0 10px;">Feature Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            ${data.map(item => `<th>${escapeHtml(item.vendor.name)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;
    
    featuresList.forEach(feature => {
      html += '<tr>';
      html += `<td>${escapeHtml(feature)}</td>`;
      
      data.forEach(item => {
        const hasFeature = item.features.find(f => f.feature === feature);
        if (hasFeature?.included) {
          html += '<td class="feature-yes">✓</td>';
        } else if (hasFeature) {
          html += '<td class="feature-no">✗</td>';
        } else {
          html += '<td class="feature-na">—</td>';
        }
      });
      
      html += '</tr>';
    });
    
    html += '</tbody></table>';
  }
  
  // Metadata
  if (options.includeMetadata) {
    html += `
      <div class="metadata">
        <h2>Export Information</h2>
        <p>Total vendors compared: ${data.length}</p>
        <p>Total plans analyzed: ${data.reduce((sum, item) => sum + item.plans.length, 0)}</p>
        <p>Total features compared: ${new Set(data.flatMap(d => d.features.map(f => f.feature))).size}</p>
        <p>Report generated by SaaSPrice.AI</p>
      </div>
    `;
  }
  
  html += '</body></html>';
  
  return html;
}

/**
 * Create a downloadable file from content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export comparison data based on options
 */
export async function exportComparison(
  data: ComparisonData[],
  options: ComparisonExportOptions
): Promise<void> {
  const filename = `${options.filename || 'comparison'}.${options.format}`;
  
  switch (options.format) {
    case 'csv': {
      const csv = generateCSV(data, options);
      downloadFile(csv, filename, 'text/csv');
      break;
    }
    
    case 'json': {
      const json = generateJSON(data, options);
      downloadFile(json, filename, 'application/json');
      break;
    }
    
    case 'pdf': {
      // For PDF, we'll generate HTML and let the browser handle printing
      // In production, you'd use a library like jsPDF or html2pdf
      const html = generateHTML(data, options);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
      break;
    }
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Helper functions
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function getPriceRange(data: ComparisonData[]) {
  const prices = data
    .flatMap(d => d.prices)
    .map(p => p.normalized_monthly_price)
    .filter(p => p !== null) as number[];
  
  if (prices.length === 0) {
    return { min: null, max: null, currency: 'USD' };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: 'USD'
  };
}