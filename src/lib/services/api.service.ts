// src/lib/services/api.service.ts

import { z } from 'zod';

// Response types
export interface LeadResponse {
  success: boolean;
  leadId: string;
  isNewLead: boolean;
  message: string;
}

export interface ExportResponse extends Blob {}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Lead management
export async function saveLead(data: {
  email: string;
  seats: number;
  company?: string;
  receiveUpdates: boolean;
  comparison?: {
    vendorA?: string;
    vendorB?: string;
    seatCount: number;
    billingPeriod: string;
  };
}): Promise<LeadResponse> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to save lead' }));
    throw new APIError(
      error.error || 'Failed to save lead information',
      response.status,
      error.details
    );
  }

  return response.json();
}

export async function checkLeadExists(email: string): Promise<{ exists: boolean }> {
  const response = await fetch(`/api/leads/check?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new APIError('Failed to check lead status', response.status);
  }

  return response.json();
}

// CSV Export
export async function exportComparison(data: {
  vendorIds: string[];
  seatCount: number;
  billingPeriod: 'monthly' | 'annual';
  includeDetails?: boolean;
}): Promise<Blob> {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate report' }));
    throw new APIError(
      error.error || 'Failed to generate comparison report',
      response.status,
      error.details
    );
  }

  return response.blob();
}

// Download helper
export function downloadBlob(
  blob: Blob,
  filename: string
): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Generate CSV filename
export function generateCSVFilename(seatCount: number): string {
  const date = new Date().toISOString().split('T')[0];
  return `saasprice-comparison-${seatCount}seats-${date}.csv`;
}