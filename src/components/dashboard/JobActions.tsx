// components/monitoring/JobActions.tsx
import React, { useState } from 'react';
import { 
  RefreshCw, 
  X, 
  Play, 
  Pause,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/ui/dialog';
import type { RecentJob } from '@/lib/types/monitoring';

interface JobActionsProps {
  job: RecentJob;
  onRetry?: (jobId: string) => Promise<void>;
  onCancel?: (jobId: string) => Promise<void>;
  onDelete?: (jobId: string) => Promise<void>;
}

export function JobActions({ job, onRetry, onCancel, onDelete }: JobActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<'retry' | 'cancel' | 'delete' | null>(null);

  const handleAction = async (action: 'retry' | 'cancel' | 'delete') => {
    setLoading(true);
    try {
      switch (action) {
        case 'retry':
          await onRetry?.(job.id);
          break;
        case 'cancel':
          await onCancel?.(job.id);
          break;
        case 'delete':
          await onDelete?.(job.id);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    } finally {
      setLoading(false);
      setConfirmDialog(null);
    }
  };

  const canRetry = job.status === 'failed';
  const canCancel = job.status === 'pending' || job.status === 'processing';
  const canDelete = job.status === 'completed' || job.status === 'failed';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {canRetry && (
            <DropdownMenuItem 
              onClick={() => setConfirmDialog('retry')}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Job
            </DropdownMenuItem>
          )}
          
          {canCancel && (
            <DropdownMenuItem 
              onClick={() => setConfirmDialog('cancel')}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Job
            </DropdownMenuItem>
          )}
          
          {canDelete && (
            <DropdownMenuItem 
              onClick={() => setConfirmDialog('delete')}
              disabled={loading}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Record
            </DropdownMenuItem>
          )}
          
          {!canRetry && !canCancel && !canDelete && (
            <DropdownMenuItem disabled>
              No actions available
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialogs */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog === 'retry' && 'Retry Job'}
              {confirmDialog === 'cancel' && 'Cancel Job'}
              {confirmDialog === 'delete' && 'Delete Job Record'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog === 'retry' && 'This will re-queue the job for processing. Are you sure?'}
              {confirmDialog === 'cancel' && 'This will stop the job from processing. Are you sure?'}
              {confirmDialog === 'delete' && 'This will permanently delete the job record. Are you sure?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmDialog && handleAction(confirmDialog)}
              disabled={loading}
              variant={confirmDialog === 'delete' ? 'destructive' : 'default'}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}