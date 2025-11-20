'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { z } from 'zod';
import * as Dialog from '@radix-ui/react-dialog';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  seats: z.number().min(1).max(10000),
  company: z.string().optional(),
  receiveUpdates: z.boolean().default(false),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmailFormData) => Promise<void>;
  seatCount?: number;
  vendorNames?: string[];
}

export function EmailCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  seatCount = 10,
  vendorNames = [],
}: EmailCaptureModalProps) {
  const [formData, setFormData] = useState<EmailFormData>({
    email: '',
    seats: seatCount,
    company: '',
    receiveUpdates: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmailFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update seat count when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, seats: seatCount }));
  }, [seatCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = emailSchema.parse(formData);
      await onSubmit(validatedData);
      // Reset form on success
      setFormData({
        email: '',
        seats: seatCount,
        company: '',
        receiveUpdates: false,
      });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof EmailFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof EmailFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Submission error:', error);
        setErrors({ email: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[var(--sp-z-backdrop)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* Modal */}
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[var(--sp-z-modal)] w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="bg-sp-surface-0 rounded-lg shadow-sp-2 p-6 border border-sp-border">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <Dialog.Title className="text-xl font-semibold text-sp-text-primary">
                  Get Your Comparison Report
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-sp-text-secondary">
                  Enter your email to download the detailed CSV comparison
                  {vendorNames.length > 0 && (
                    <span> for {vendorNames.join(' vs ')}</span>
                  )}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className="text-sp-text-muted hover:text-sp-text-secondary transition-colors rounded-sm opacity-70 ring-offset-sp-surface-0 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-sp-focus focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label 
                  htmlFor="email-input"
                  className="block text-sm font-medium text-sp-text-primary mb-1"
                >
                  Work Email *
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`
                    w-full px-3 py-2 rounded-md
                    bg-sp-surface-1 text-sp-text-primary
                    border ${errors.email 
                      ? 'border-sp-error focus:ring-sp-error' 
                      : 'border-sp-border focus:ring-sp-accent'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sp-surface-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder:text-sp-text-muted
                  `}
                  placeholder="rebecca@company.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-sp-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Company field (optional) */}
              <div>
                <label 
                  htmlFor="company-input"
                  className="block text-sm font-medium text-sp-text-primary mb-1"
                >
                  Company (optional)
                </label>
                <input
                  id="company-input"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="
                    w-full px-3 py-2 rounded-md
                    bg-sp-surface-1 text-sp-text-primary
                    border border-sp-border
                    focus:outline-none focus:ring-2 focus:ring-sp-accent focus:ring-offset-2 focus:ring-offset-sp-surface-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    placeholder:text-sp-text-muted
                  "
                  placeholder="Acme Corp"
                  disabled={isSubmitting}
                />
              </div>

              {/* Seat count (pre-filled) */}
              <div>
                <label 
                  htmlFor="seats-input"
                  className="block text-sm font-medium text-sp-text-primary mb-1"
                >
                  Team Size (seats)
                </label>
                <input
                  id="seats-input"
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
                  className={`
                    w-full px-3 py-2 rounded-md
                    bg-sp-surface-1 text-sp-text-primary
                    border ${errors.seats 
                      ? 'border-sp-error focus:ring-sp-error' 
                      : 'border-sp-border focus:ring-sp-accent'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sp-surface-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  disabled={isSubmitting}
                />
                {errors.seats && (
                  <p className="mt-1 text-sm text-sp-error" role="alert">
                    {errors.seats}
                  </p>
                )}
              </div>

              {/* Newsletter opt-in */}
              <div className="flex items-start">
                <input
                  id="updates-checkbox"
                  type="checkbox"
                  checked={formData.receiveUpdates}
                  onChange={(e) => setFormData({ ...formData, receiveUpdates: e.target.checked })}
                  className="
                    h-4 w-4 mt-0.5
                    text-sp-accent bg-sp-surface-1 border-sp-border rounded
                    focus:ring-2 focus:ring-sp-accent focus:ring-offset-2 focus:ring-offset-sp-surface-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  disabled={isSubmitting}
                />
                <label 
                  htmlFor="updates-checkbox"
                  className="ml-2 text-sm text-sp-text-secondary"
                >
                  Send me price change alerts and weekly insights (unsubscribe anytime)
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full py-2.5 px-4
                  bg-sp-accent hover:bg-sp-accent-hover 
                  text-white font-medium rounded-md
                  focus:outline-none focus:ring-2 focus:ring-sp-accent focus:ring-offset-2 focus:ring-offset-sp-surface-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {isSubmitting ? 'Processing...' : 'Download Comparison CSV'}
              </button>

              {/* Privacy note */}
              <p className="text-xs text-sp-text-muted text-center">
                We respect your privacy. Your email is only used to send the report
                {formData.receiveUpdates && ' and optional updates'}.
              </p>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}