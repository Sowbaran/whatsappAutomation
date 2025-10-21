import { useMemo, useState } from 'react';
import { UserPlus, TrendingUp, Users, CheckCircle, Clock, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AssignSalesmanDialog } from '@/components/orders/AssignSalesmanDialog';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, fetchSalesmen, assignOrderToSalesman, type BackendOrder, type BackendSalesman } from '@/lib/api';

const mapStatus = (s?: string): StatusType => {
  if (!s) return 'pending';
  const v = s.toLowerCase();
  if (v === 'completed' || v === 'delivered') return 'completed';
  if (v === 'cancelled' || v === 'canceled') return 'cancelled';
  if (['processing','picked up','picked-up','salesman-assigned','shipped','in_progress'].includes(v)) return 'processing';
  return 'pending';
};

const SalesProgress = () => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{id: string, currentSalesman: string | null} | null>(null);

  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  const { data: salesmenData } = useQuery({ queryKey: ['salesmen'], queryFn: fetchSalesmen });
  const orders = (ordersData || []) as BackendOrder[];
  const salesmen = (salesmenData || []) as BackendSalesman[];

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => mapStatus(o.status) === 'pending').length;
    const processingOrders = orders.filter(o => mapStatus(o.status) === 'processing').length;
    const completedOrders = orders.filter(o => mapStatus(o.status) === 'completed').length;
    const activeSalesmen = new Set(orders.map(o => typeof o.salesman === 'object' && o.salesman && 'name' in o.salesman ? (o.salesman as any).name : o.salesman).filter(Boolean)).size;
    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      activeSalesmen,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    };
  }, [orders]);

  const unassignedOrders = useMemo(() => {
    return orders.filter(o => !o.salesman).map(o => ({
      id: o._id, // Use MongoDB _id for API calls
      orderId: o.orderId, // Keep orderId for display
      customer: { name: o.customer?.name || '', email: o.customer?.email || '' },
      date: o.createdAt ? new Date(o.createdAt).toISOString().slice(0,10) : '',
      total: o.totalAmount || 0,
      status: mapStatus(o.status),
    }));
  }, [orders]);

  const handleAssignClick = (orderId: string) => {
    setSelectedOrder({ id: orderId, currentSalesman: null });
    setAssignDialogOpen(true);
  };

  const handleAssign = async (salesmanId: number, salesmanName: string) => {
    if (!selectedOrder) return;
    
    try {
      // Find the salesman by name to get their MongoDB _id
      const salesman = salesmen.find(s => s.name === salesmanName);
      
      if (!salesman) {
        console.error('Salesman not found');
        return;
      }

      // Call backend API to assign salesman
      await assignOrderToSalesman(selectedOrder.id, salesman._id);
      
      // Close dialog
      setAssignDialogOpen(false);
      
      // Show success message
      console.log(`${salesmanName} has been assigned to order ${selectedOrder.id}`);
      
    } catch (error) {
      console.error('Error assigning salesman:', error);
    }
  };

  const handleUnassign = () => {
    setAssignDialogOpen(false);
  };

  // Get list of currently assigned salesmen for other orders
  const assignedSalesmen = Array.from(new Set(
    orders
      .filter(o => o.salesman)
      .map(o => (typeof o.salesman === 'object' && o.salesman && 'name' in o.salesman) ? (o.salesman as any).name : String(o.salesman))
  )) as string[];

  // console.log("Pending orders:", stats.pendingOrders)

  return (
    <div className="space-y-3 p-2 sm:space-y-4 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Overview of your sales performance and order status</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
        {/* Orders Summary */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-1 pt-2">
          <CardTitle className="text-xs sm:text-sm">Orders Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex flex-wrap items-center gap-7">
            <div className="flex items-center gap-3">
              <span className="h-14 w-14 sm:h-12 sm:w-12 md:h-10 md:w-10 rounded-sm bg-amber-100 flex items-center justify-center mr-4 sm:mr-0">
                <Clock className="h-8 w-8 sm:h-7 sm:w-7 md:h-6 md:w-6 text-amber-700" />
              </span>
              <span className="text-2xl sm:text-xl md:text-lg font-semibold text-white">{stats.pendingOrders}</span>
              <span className="text-base sm:text-sm md:text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-14 w-14 sm:h-12 sm:w-12 md:h-10 md:w-10 rounded-sm bg-blue-100 flex items-center justify-center mr-4 sm:mr-0">
                <TrendingUp className="h-8 w-8 sm:h-7 sm:w-7 md:h-6 md:w-6 text-blue-700" />
              </span>
              <span className="text-2xl sm:text-xl md:text-lg font-semibold text-white">{stats.processingOrders}</span>
              <span className="text-base sm:text-sm md:text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-14 w-14 sm:h-12 sm:w-12 md:h-10 md:w-10 rounded-sm bg-emerald-100 flex items-center justify-center mr-4 sm:mr-0">
                <CheckCircle className="h-8 w-8 sm:h-7 sm:w-7 md:h-6 md:w-6 text-emerald-700" />
              </span>
              <span className="text-2xl sm:text-xl md:text-lg font-semibold text-white">{stats.completedOrders}</span>
              <span className="text-base sm:text-sm md:text-xs text-muted-foreground">Completed</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm sm:text-base text-muted-foreground">Total</p>
              <p className="text-lg sm:text-xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="mt-2">
              <Progress value={stats.completionRate} className="h-2.5" />
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                {stats.completionRate}% completed
              </p>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Sales Team */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm sm:text-base md:text-lg">Sales Team</CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active Members</p>
                <p className="text-base sm:text-xl font-semibold">{stats.activeSalesmen}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Team</p>
                <p className="text-base sm:text-xl font-semibold">{salesmen.length}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium">Top Performers</p>
              <div className="space-y-2">
                {salesmen.slice(0, 3).map((salesman) => (
                  <div key={String(salesman._id)} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarFallback className="text-[10px]">
                          {(salesman.name || '').split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{salesman.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {(salesman.activeOrders || 0)} active orders
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold whitespace-nowrap ml-2">
                      ${(salesman.totalSales || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Unassigned Orders */}
      <Card className="overflow-hidden">
        <CardHeader className="py-2 sm:py-3">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base md:text-lg">Unassigned Orders</CardTitle>
              <CardDescription className="text-xs">
                {unassignedOrders.length} orders waiting to be assigned
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">Loading...</div>
          ) : ordersError ? (
            <div className="text-center py-6 text-red-600 text-sm">Failed to load.</div>
          ) : unassignedOrders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>All orders have been assigned to salesmen</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {unassignedOrders.map((order) => (
                <div key={order.id} className="p-3 hover:bg-muted/30 transition-colors">
                  {/* Mobile View */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Order #{order.orderId}</p>
                        <p className="text-sm font-medium">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.customer.email}</p>
                      </div>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <p className="text-xs text-muted-foreground">Date: {order.date}</p>
                        <p className="text-sm font-semibold">${order.total.toFixed(2)}</p>
                      </div>
                      <Button 
                        size="sm"
                        className="gap-1.5 text-xs h-7 px-2"
                        onClick={() => handleAssignClick(order.id)}
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Assign</span>
                      </Button>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:grid grid-cols-12 items-center gap-2 text-sm">
                    <div className="col-span-2 font-medium">{order.orderId}</div>
                    <div className="col-span-3">
                      <p className="font-medium truncate">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customer.email}</p>
                    </div>
                    <div className="col-span-2">{order.date}</div>
                    <div className="col-span-2 font-semibold">${order.total.toFixed(2)}</div>
                    <div className="col-span-1">
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="col-span-2 text-right">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-8 px-2"
                        onClick={() => handleAssignClick(order.id)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Assign</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignSalesmanDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        orderId={selectedOrder?.id || ''}
        currentSalesman={selectedOrder?.currentSalesman || null}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        assignedSalesmen={assignedSalesmen}
      />
    </div>
  );
};

export default SalesProgress;