import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { StatusBadge, type StatusType } from "@/components/ui/status-badge";
import { BackendOrder } from "@/lib/api";

interface OrdersByStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: StatusType;
  orders: Array<{
    id: string;
    orderId: string;
    customer: { name: string; email: string };
    date: string;
    total: number;
    status: StatusType;
  }>;
}

export function OrdersByStatusDialog({ open, onOpenChange, status, orders }: OrdersByStatusDialogProps) {
  const navigate = useNavigate();
  
  // Update URL hash when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Set hash when dialog opens
      window.history.pushState({}, '', `#${status}`);
    } else if (!open && window.location.hash) {
      // Clear hash when dialog is closed via the close button
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }, [open, status]);
  
  const handleOrderClick = (orderId: string) => {
    // Don't close the dialog, just navigate
    navigate(`/orders/${orderId}`, {
      state: { fromDialog: status } // Store the current status in location state
    });
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Clear hash when dialog is closed
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
    }
    onOpenChange(isOpen);
  };
  const statusLabels = {
    'pending': 'Pending',
    'processing': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'picked-up': 'Picked Up',
    'assigned': 'Assigned'
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {statusLabels[status]} Orders
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-2 -mr-2">
          <div className="space-y-3 pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No {statusLabels[status].toLowerCase()} orders found.
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2">
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="text-sm font-medium">{order.orderId}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="text-sm font-medium">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customer.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm">{order.date}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-semibold">₹{order.total.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
