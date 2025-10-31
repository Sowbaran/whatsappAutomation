import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSave: (paymentDetails: {
    method: string;
    status: string;
    transactionId?: string;
  }) => void;
}

export function EditPaymentDialog({
  open,
  onOpenChange,
  order,
  onSave
}: EditPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState(order.payment.method);
  const [paymentStatus, setPaymentStatus] = useState(order.payment.status);
  const [transactionId, setTransactionId] = useState(order.payment.transactionId);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Reset states when dialog is opened/closed
  useEffect(() => {
    if (open) {
      setPaymentMethod(order.payment.method);
      setPaymentStatus(order.payment.status);
      setTransactionId(order.payment.transactionId);
      setIsEditing(true);
      setShowConfirm(false);
    }
  }, [open, order.payment]);

  // Handle save button click - show confirmation
  const handleSave = () => {
    setIsEditing(false);
    setShowConfirm(true);
  };

  // Handle cancel button click
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Confirm and save changes
  const confirmSave = () => {
    onSave({
      method: paymentMethod,
      status: paymentStatus,
      transactionId: transactionId || undefined
    });

    toast({
      title: 'Payment Updated',
      description: 'Payment information has been updated successfully'
    });

    setShowConfirm(false);
    onOpenChange(false);
  };

  // Cancel confirmation and return to edit
  const cancelConfirm = () => {
    setShowConfirm(false);
    setIsEditing(true);
  };

  return (
    <>
      {/* --- Main Edit Payment Dialog --- */}
      <Dialog open={open && isEditing} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[500px] w-full max-w-[95vw] p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle id="payment-edit-title">
                Edit Payment Information
              </DialogTitle>
            </VisuallyHidden>
            <DialogTitle className="text-xl">
              Edit Payment Information
            </DialogTitle>
            <DialogDescription id="payment-edit-description">
              Update the payment details for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <Input
                id="transaction-id"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="TXN123456789"
              />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Confirmation Dialog --- */}
      <AlertDialog open={showConfirm && open} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <VisuallyHidden>
              <AlertDialogTitle id="confirm-dialog-title">
                Confirm Payment Update
              </AlertDialogTitle>
            </VisuallyHidden>
            <AlertDialogTitle className="text-xl">
              Confirm Payment Update
            </AlertDialogTitle>
            <AlertDialogDescription
              id="confirm-dialog-description"
              className="text-muted-foreground"
            >
              Are you sure you want to update the payment information?
              <div className="mt-2 space-y-1">
                <p>
                  <span className="font-medium text-foreground">
                    Payment Method:
                  </span>{' '}
                  {paymentMethod}
                </p>
                <p>
                  <span className="font-medium text-foreground">Status:</span>{' '}
                  {paymentStatus}
                </p>
                {transactionId && (
                  <p>
                    <span className="font-medium text-foreground">
                      Transaction ID:
                    </span>{' '}
                    {transactionId}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelConfirm} className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant"
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
