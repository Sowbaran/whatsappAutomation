import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesmen, type BackendSalesman } from '@/lib/api';

interface AssignSalesmanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentSalesman: string | null;
  onAssign: (salesmanId: number, salesmanName: string) => void;
  onUnassign?: () => void; // Add unassign handler
  assignedSalesmen: string[]; // List of salesman names already assigned to orders
}


export function AssignSalesmanDialog({
  open,
  onOpenChange,
  orderId,
  currentSalesman,
  onAssign,
  onUnassign,
  assignedSalesmen
}: AssignSalesmanDialogProps) {
  const [selectedSalesman, setSelectedSalesman] = useState<number | null>(null);

  // Load salesmen from backend
  const { data } = useQuery({ queryKey: ['salesmen'], queryFn: fetchSalesmen });
  const availableSalesmen = (data || []).map((s: BackendSalesman, idx: number) => ({
    id: idx + 1,
    name: s.name,
    email: s.email || '',
    activeOrders: s.activeOrders || 0,
    totalSales: s.totalSales || 0,
    avatar: '/placeholder.svg',
  }));

  // Reset selection when dialog is opened/closed
  useEffect(() => {
    if (open) {
      // Pre-select current salesman if exists
      if (currentSalesman) {
        const current = availableSalesmen.find(s => s.name === currentSalesman);
        setSelectedSalesman(current?.id || null);
      } else {
        setSelectedSalesman(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentSalesman, data]);

  const handleAssign = () => {
    if (!selectedSalesman) {
      toast({
        title: 'No Salesman Selected',
        description: 'Please select a salesman to assign to this order.',
        variant: 'destructive',
      });
      return;
    }

    const salesman = availableSalesmen.find(s => s.id === selectedSalesman);
    if (salesman) {
      onAssign(salesman.id, salesman.name);
      onOpenChange(false);
      
      toast({
        title: 'Salesman Assigned',
        description: `${salesman.name} has been assigned to order ${orderId}`,
      });
    }
  };

  const handleUnassign = () => {
    if (onUnassign) {
      onUnassign();
      if (onOpenChange) {
        onOpenChange(false);
      }
      
      toast({
        title: 'Salesman Unassigned',
        description: `Salesman has been unassigned from order ${orderId}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full max-w-[95vw] bg-card border-border/50 shadow-xl p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {currentSalesman ? 'Change Salesman' : 'Assign Salesman'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {currentSalesman 
              ? `Currently assigned to: ${currentSalesman}` 
              : 'Select a salesman to assign to this order'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {availableSalesmen.length > 0 ? (
              availableSalesmen.map((salesman) => (
                <div 
                  key={salesman.id}
                  onClick={() => setSelectedSalesman(salesman.id)}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedSalesman === salesman.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent/50'
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={salesman.avatar} alt={salesman.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {salesman.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{salesman.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{salesman.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{salesman.activeOrders} active orders</p>
                    <p className="text-xs text-muted-foreground">₹{salesman.totalSales.toLocaleString()} total sales</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available salesmen to assign.</p>
                <p className="text-sm mt-1">All salesmen are currently assigned to orders.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          {currentSalesman && onUnassign && (
            <Button 
              variant="outline"
              onClick={handleUnassign}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors flex items-center gap-2 group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Unassign Current Salesman
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-border hover:bg-accent/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedSalesman}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant disabled:opacity-50 disabled:pointer-events-none"
            >
              {currentSalesman ? 'Update Assignment' : 'Assign Salesman'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
