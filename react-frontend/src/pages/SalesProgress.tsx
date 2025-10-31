import React, { useMemo, useState, useEffect } from 'react';
import { UserPlus, TrendingUp, Users, CheckCircle, Clock, Clock3, AlertCircle } from 'lucide-react';
import { OrdersByStatusDialog } from '@/components/orders/OrdersByStatusDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AssignSalesmanDialog } from '@/components/orders/AssignSalesmanDialog';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { fetchOrders, fetchSalesmen, assignOrderToSalesman, type BackendOrder, type BackendSalesman } from '@/lib/api';

const mapStatus = (s?: string): StatusType => {
  if (!s) return 'pending';
  const v = s.toLowerCase().trim();
  if (v === 'completed' || v === 'delivered') return 'completed';
  if (v === 'cancelled' || v === 'canceled') return 'cancelled';
  if (v === 'picked up' || v === 'picked-up') return 'picked-up';
  if (v === 'salesman assigned' || v === 'salesman-assigned') return 'assigned';
  if (['processing', 'in_progress', 'in progress', 'shipped'].includes(v)) return 'processing';
  return 'pending';
};

const SalesProgress = () => {
  const location = useLocation();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);

  // Check for dialog state in both location state and browser history state
  useEffect(() => {
    const checkDialogState = () => {
      // First check URL hash for dialog state
      const hash = window.location.hash.replace('#', '');
      const statuses: StatusType[] = ['pending', 'processing', 'completed', 'cancelled', 'picked-up', 'assigned'];
      
      if (hash && statuses.includes(hash as StatusType)) {
        setSelectedStatus(hash as StatusType);
        setStatusDialogOpen(true);
        return;
      }
      
      // Then check location state
      if (location.state?.fromDialog) {
        setSelectedStatus(location.state.fromDialog);
        setStatusDialogOpen(true);
        // Clear the state to prevent the dialog from reopening on refresh
        window.history.replaceState({}, '');
      }
    };

    // Check on initial load
    checkDialogState();

    // Also handle browser back/forward navigation
    const handlePopState = () => {
      checkDialogState();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.state]);
  const [selectedOrder, setSelectedOrder] = useState<{id: string, currentSalesman: string | null} | null>(null);

  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  const { data: salesmenData } = useQuery({ queryKey: ['salesmen'], queryFn: fetchSalesmen });
  const orders = (ordersData || []) as BackendOrder[];
  const salesmen = (salesmenData || []) as BackendSalesman[];

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
      const status = mapStatus(order.status);
      console.log(`Order ${order.orderId} - Raw status: ${order.status}, Mapped status: ${status}`);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<StatusType, number>);
    
    console.log('Status counts:', statusCounts);
    
    const activeSalesmen = new Set(
      orders
        .map(o => {
          const salesman = o.salesman;
          if (salesman && typeof salesman === 'object' && 'name' in salesman) {
            return (salesman as { name: string }).name;
          }
          return salesman as string;
        })
        .filter(Boolean)
    ).size;

    const completedOrders = statusCounts['completed'] || 0;
    
    return {
      totalOrders,
      statusCounts,
      activeSalesmen,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    };
  }, [orders]);

  const allOrders = useMemo(() => {
    return orders.map(o => ({
      id: o._id,
      orderId: o.orderId,
      customer: { name: o.customer?.name || '', email: o.customer?.email || '' },
      date: o.createdAt ? new Date(o.createdAt).toISOString().slice(0,10) : '',
      total: o.totalAmount || 0,
      status: mapStatus(o.status),
    }));
  }, [orders]);

  const unassignedOrders = useMemo(() => {
    return allOrders.filter(o => !orders.find(order => order._id === o.id)?.salesman);
  }, [allOrders, orders]);

  const handleStatusClick = (status: StatusType) => {
    // Store the status in URL hash when opening the dialog
    window.history.pushState({ statusDialog: status }, '');
    setSelectedStatus(status);
    setStatusDialogOpen(true);
  };
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.statusDialog) {
        const status = event.state.statusDialog as StatusType;
        setSelectedStatus(status);
        setStatusDialogOpen(true);
      } else {
        setStatusDialogOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getOrdersByStatus = (status: StatusType) => {
    return allOrders.filter(order => mapStatus(orders.find(o => o._id === order.id)?.status) === status);
  };

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Pending */}
              <div 
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer transition-colors"
                onClick={() => handleStatusClick('pending')}
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-1">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground">{stats.statusCounts['pending'] || 0}</span>
                <span className="text-xs text-muted-foreground text-center">Pending</span>
              </div>

              {/* Salesman Assigned */}
              <div 
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                onClick={() => handleStatusClick('assigned')}
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-1">
                  <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground">
                  {(stats.statusCounts['assigned'] || 0) + (stats.statusCounts['salesman-assigned'] || 0)}
                </span>
                <span className="text-xs text-muted-foreground text-center">Assigned</span>
              </div>

              {/* Picked Up */}
              <div 
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors"
                onClick={() => handleStatusClick('picked-up')}
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-1">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground">{stats.statusCounts['picked-up'] || 0}</span>
                <span className="text-xs text-muted-foreground text-center">Picked Up</span>
              </div>

              {/* In Progress */}
              <div 
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors"
                onClick={() => handleStatusClick('processing')}
              >
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-1">
                  <Clock3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground">{stats.statusCounts['processing'] || 0}</span>
                <span className="text-xs text-muted-foreground text-center">In Progress</span>
              </div>

              {/* Completed */}
              <div 
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-pointer transition-colors"
                onClick={() => handleStatusClick('completed')}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-1">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground">{stats.statusCounts['completed'] || 0}</span>
                <span className="text-xs text-muted-foreground text-center">Completed</span>
              </div>

              {/* Cancelled */}
              <div 
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 cursor-pointer transition-colors"
                onClick={() => handleStatusClick('cancelled')}
              >
                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-1">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-lg sm:text-xl font-semibold text-foreground">{stats.statusCounts['cancelled'] || 0}</span>
                <span className="text-xs text-muted-foreground text-center">Cancelled</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm sm:text-base text-muted-foreground">Total Orders</p>
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
              <p className="text-xs sm:text-sm font-medium">Team Members</p>
              <div className="h-[200px] overflow-y-auto pr-2 -mr-2">
                <div className="space-y-2 pr-2">
                  {salesmen.map((salesman) => (
                    <div key={String(salesman._id)} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors border border-muted/20">
                      <div className="flex items-center space-x-2 overflow-hidden flex-1">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {(salesman.name || '').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-medium truncate">{salesman.name}</p>
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                              {salesman.activeOrders || 0} orders
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, ((salesman.activeOrders || 0) / Math.max(1, Math.max(...salesmen.map(s => s.activeOrders || 0)))) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap ml-2">
                        ₹{(salesman.totalSales || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
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
                        <p className="text-sm font-semibold">₹{order.total.toFixed(2)}</p>
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
                    <div className="col-span-2 font-semibold">₹{order.total.toFixed(2)}</div>
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

      {selectedStatus && (
        <OrdersByStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          status={selectedStatus}
          orders={getOrdersByStatus(selectedStatus)}
        />
      )}
    </div>
  );
};

export default SalesProgress;