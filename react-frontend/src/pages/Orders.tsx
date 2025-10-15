import { useState } from 'react';
import { Search, Eye, User, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockOrders, mockSalesmen } from '@/lib/mockData';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AssignSalesmanDialog } from '@/components/orders/AssignSalesmanDialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, Variants } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [orders, setOrders] = useState(mockOrders);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAssignSalesman = (salesmanId: number, salesmanName: string) => {
    if (!selectedOrder) return;
    
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
    
    setAssignDialogOpen(false);
  };

  const handleUnassignSalesman = () => {
    if (!orderToUnassign) return;
    
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
    
    setUnassignDialogOpen(false);
    setOrderToUnassign(null);
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
                      <span className="font-mono text-sm bg-muted/10 px-2 py-1 rounded">{order.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{order.items.length} items</td>
                    <td className="py-4 px-4 font-semibold text-foreground">${order.total.toFixed(2)}</td>
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
                          <Link to={`/orders/${order.id}`}>
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
                        </motion.div>
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