import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  onStatusUpdate: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function UpdateStatusDialog({ open, onOpenChange, orderId, onStatusUpdate }: UpdateStatusDialogProps) {
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = () => {
    if (!status) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmStatusUpdate = () => {
    // Call the onStatusUpdate callback with the new status
    onStatusUpdate(status);
    
    // Show success message
    toast({
      title: 'Status Updated',
      description: `Order ${orderId || ''} status has been updated to ${status}`,
    });

    // Reset form and close
    setStatus('');
    setReason('');
    setPurpose('');
    setShowConfirmDialog(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] w-full max-w-[95vw] p-3 sm:p-6 max-h-[90vh] overflow-y-auto"
        aria-describedby="status-update-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl" id="status-update-title">
            Update Order Status
          </DialogTitle>
          <DialogDescription id="status-update-description">
            Update the status and provide details for order {orderId || ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Enter the purpose of this change..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant"
          >
            Update Status
          </Button>
        </DialogFooter>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Confirm Status Update</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to update the order status to <span className="font-semibold text-foreground">
                  {statusOptions.find(s => s.value === status)?.label || status}
                </span>?
                {reason && (
                  <div className="mt-2">
                    <p className="font-medium text-foreground">Reason:</p>
                    <p className="text-muted-foreground">{reason}</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmStatusUpdate}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant"
              >
                Confirm Update
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
