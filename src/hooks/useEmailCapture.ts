'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { 
  saveLead, 
  exportComparison, 
  downloadBlob, 
  generateCSVFilename,
  APIError 
} from '@/lib/services/api.service';

// Types matching the EmailCaptureModal
const emailFormSchema = z.object({
  email: z.string().email(),
  seats: z.number().min(1).max(10000),
  company: z.string().optional(),
  receiveUpdates: z.boolean().default(false),
});

type EmailFormData = z.infer<typeof emailFormSchema>;

interface UseEmailCaptureOptions {
  vendorIds: string[];
  vendorNames?: string[];
  seatCount?: number;
  billingPeriod?: 'monthly' | 'annual';
  onSuccess?: () => void;
  onError?: (error: Error, step: 'lead' | 'export') => void;
}

interface UseEmailCaptureReturn {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleSubmit: (formData: EmailFormData) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

export function useEmailCapture({
  vendorIds,
  vendorNames = [],
  seatCount = 10,
  billingPeriod = 'monthly',
  onSuccess,
  onError,
}: UseEmailCaptureOptions): UseEmailCaptureReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setError(null); // Clear any previous errors
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (formData: EmailFormData) => {
    setIsProcessing(true);
    setError(null);

    // Step 1: Save lead to database
    try {
      const leadData = await saveLead({
        ...formData,
        comparison: {
          vendorA: vendorNames[0],
          vendorB: vendorNames[1],
          seatCount,
          billingPeriod,
        },
      });
      
      console.log('Lead saved:', leadData.message);
    } catch (leadError) {
      const message = leadError instanceof APIError 
        ? leadError.message 
        : 'Failed to save your information';
      
      setError(message);
      onError?.(leadError as Error, 'lead');
      alert(`${message}. Please try again.`);
      setIsProcessing(false);
      return; // Exit early - no point continuing if lead save failed
    }

    // Step 2: Generate and download CSV
    try {
      const csvBlob = await exportComparison({
        vendorIds,
        seatCount: formData.seats || seatCount,
        billingPeriod,
        includeDetails: true,
      });

      // Download the CSV
      const filename = generateCSVFilename(formData.seats || seatCount);
      downloadBlob(csvBlob, filename);

      // Success - close modal and trigger callback
      closeModal();
      onSuccess?.();
      
      console.log('✅ Report downloaded successfully!');
      
    } catch (exportError) {
      const message = exportError instanceof APIError 
        ? exportError.message 
        : 'Failed to generate comparison report';
      
      setError(message);
      onError?.(exportError as Error, 'export');
      alert(`${message}. Your information was saved and you can try downloading again later.`);
    } finally {
      setIsProcessing(false);
    }
  }, [vendorIds, vendorNames, seatCount, billingPeriod, closeModal, onSuccess, onError]);

  return {
    isModalOpen,
    openModal,
    closeModal,
    handleSubmit,
    isProcessing,
    error,
  };
}