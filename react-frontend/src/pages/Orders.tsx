import { useState, useEffect } from 'react';
import { Search, Eye, User, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AssignSalesmanDialog } from '@/components/orders/AssignSalesmanDialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, Variants } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchSalesmen, assignOrderToSalesman, unassignOrderFromSalesman, type BackendOrder, type BackendSalesman } from '@/lib/api';

const mapStatus = (s?: string): StatusType => {
  if (!s) return 'pending';
  const v = s.toLowerCase();
  if (v === 'completed' || v === 'delivered') return 'completed';
  if (v === 'cancelled' || v === 'canceled') return 'cancelled';
  if (v === 'active' || v === 'inactive') return v as StatusType;
  if (['processing','picked up','picked-up','salesman-assigned','shipped','in_progress'].includes(v)) return 'processing';
  return 'pending';
};

const buttonVariants: Variants = {
  hover: {
    scale: 1.03,
    transition: { 
      type: 'spring' as const,
      stiffness: 400,
      damping: 10 
    }
  },
  tap: {
    scale: 0.98
  }
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{id: string, currentSalesman: string | null} | null>(null);
  const [orderToUnassign, setOrderToUnassign] = useState<{id: string, salesmanName: string} | null>(null);
  const [orders, setOrders] = useState(() => [] as Array<{
    id: string; // Mongo _id for routing
    orderNumber?: string; // human-friendly orderId
    customer: { name: string; email?: string; address?: string; phone?: string };
    date: string;
    items: Array<{ id: string; name: string; price: number; quantity: number; discount?: number }>;
    total: number;
    salesman: string | null;
    status: StatusType;
  }>);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const { data: salesmenData } = useQuery({
    queryKey: ['salesmen'],
    queryFn: fetchSalesmen,
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Sort orders by createdAt descending (most recent first) before mapping
      const sorted = ([...(data as BackendOrder[])]).sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      const mapped = sorted.map((o) => ({
        id: (o as any)._id, // use Mongo _id for routing
        orderNumber: o.orderId || (o as any)._id, // display-friendly
        customer: {
          name: o.customer?.name || 'Unknown',
          email: o.customer?.email,
          address: o.customer?.shippingAddress || o.customer?.billingAddress,
          phone: o.customer?.phone,
        },
        date: o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '',
        items: (o.products || []).map((p, idx) => ({
          id: String(idx + 1),
          name: p.product,
          price: p.price,
          quantity: p.quantity,
          discount: 0,
        })),
        total: o.totalAmount,
        salesman: typeof o.salesman === 'object' && o.salesman && 'name' in o.salesman ? (o.salesman.name as string) : null,
        status: mapStatus(o.status),
      }));
      setOrders(mapped);
    }
  }, [data]);

  const filteredOrders = orders.filter(order =>
    ((order.orderNumber || order.id || '') as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignedSalesmen = (currentOrderId: string) => {
    return Array.from(
      new Set(
        orders
          .filter(o => o.id !== currentOrderId && o.salesman)
          .map(o => o.salesman as string)
      )
    );
  };

  const handleAssignClick = (orderId: string, currentSalesman: string | null) => {
    setSelectedOrder({ id: orderId, currentSalesman });
    setAssignDialogOpen(true);
  };

  const handleAssignSalesman = async (salesmanId: number, salesmanName: string) => {
    if (!selectedOrder) return;
    
    try {
      // Get salesmen data from the existing query
      const salesmen = (salesmenData || []) as BackendSalesman[];
      const salesman = salesmen.find(s => s.name === salesmanName);
      
      if (!salesman) {
        toast({
          title: 'Error',
          description: 'Salesman not found',
          variant: 'destructive',
        });
        return;
      }

      // Call backend API to assign salesman
      await assignOrderToSalesman(selectedOrder.id, salesman._id);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, salesman: salesmanName } 
            : order
        )
      );
      
      toast({
        title: 'Salesman Assigned',
        description: `${salesmanName} has been assigned to order #${selectedOrder.id}`
      });
      
    } catch (error) {
      console.error('Error assigning salesman:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign salesman. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAssignDialogOpen(false);
    }
  };

  const handleUnassignSalesman = async () => {
    if (!orderToUnassign) return;
    
    try {
      // Call backend API to unassign salesman
      await unassignOrderFromSalesman(orderToUnassign.id);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderToUnassign.id 
            ? { ...order, salesman: null } 
            : order
        )
      );
      
      toast({
        title: 'Salesman Unassigned',
        description: `${orderToUnassign.salesmanName} has been unassigned from order #${orderToUnassign.id}`
      });
      
    } catch (error) {
      console.error('Error unassigning salesman:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign salesman. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUnassignDialogOpen(false);
      setOrderToUnassign(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Orders Management
        </h1>
      </div>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-card to-card/80 border-b border-border/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              All Orders
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/80 backdrop-blur-sm border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground">Loading orders...</div>
            )}
            {isError && (
              <div className="p-4 text-sm text-red-600">Failed to load orders.</div>
            )}
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Salesman</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b border-border/30 hover:bg-muted/5 transition-colors"
                    onMouseEnter={() => setHoveredOrder(order.id)}
                    onMouseLeave={() => setHoveredOrder(null)}
                  >
                    <td className="py-4 px-4 font-medium">
                      <span className="font-mono text-sm bg-muted/10 px-2 py-1 rounded">{order.orderNumber || order.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{order.items.length} items</td>
                    <td className="py-4 px-4 font-semibold text-foreground">₹{order.total.toFixed(2)}</td>
                    <td className="py-4 px-4 text-sm">
                      {order.salesman ? (
                        <div className="group relative inline-flex items-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <User className="h-3 w-3" />
                            {order.salesman}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderToUnassign({ id: order.id, salesmanName: order.salesman! });
                              setUnassignDialogOpen(true);
                            }}
                            className="ml-1.5 p-0.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                            title="Unassign salesman"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <Link to={`/orders/${order.orderNumber || order.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "h-8 px-3 gap-1.5 text-sm font-medium transition-all duration-200",
                                "bg-background hover:bg-primary/5 text-primary hover:text-primary/90 border border-border/40",
                                "hover:shadow-sm hover:border-primary/30"
                              )}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </Button>
                          </Link>
                        </motion.div
>
                        <motion.div
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                              "h-8 px-3 gap-1.5 text-sm font-medium transition-all duration-200",
                              "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
                              "hover:bg-primary/10 hover:border-primary/30 text-foreground/90 hover:text-foreground",
                              "hover:shadow-sm"
                            )}
                            onClick={() => handleAssignClick(order.id, order.salesman || null)}
                            title={order.salesman ? 'Change Salesman' : 'Assign Salesman'}
                          >
                            <User className="h-3.5 w-3.5" />
                            <span>{order.salesman ? 'Change' : 'Assign'}</span>
                          </Button>
                        </motion.div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <AssignSalesmanDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          orderId={selectedOrder.id}
          currentSalesman={selectedOrder.currentSalesman}
          onAssign={handleAssignSalesman}
          onUnassign={() => {
            if (selectedOrder && selectedOrder.currentSalesman) {
              setOrderToUnassign({
                id: selectedOrder.id,
                salesmanName: selectedOrder.currentSalesman
              });
              setUnassignDialogOpen(true);
            }
          }}
          assignedSalesmen={getAssignedSalesmen(selectedOrder.id)}
        />
      )}

      <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-medium leading-none tracking-tight">
                Unassign Salesman
              </h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to unassign {orderToUnassign?.salesmanName} from this order?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUnassignDialogOpen(false);
                  setOrderToUnassign(null);
                }}
                className="border-border/50 hover:bg-accent/50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleUnassignSalesman}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 shadow-elegant"
              >
                Unassign
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;