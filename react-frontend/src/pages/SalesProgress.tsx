import { useState } from 'react';
import { UserPlus, TrendingUp, Users, CheckCircle, Clock, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockSalesmen, mockOrders } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AssignSalesmanDialog } from '@/components/orders/AssignSalesmanDialog';
import { Progress } from '@/components/ui/progress';

// Helper function to calculate statistics
const calculateStats = () => {
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;
  const processingOrders = mockOrders.filter(order => order.status === 'processing').length;
  const completedOrders = mockOrders.filter(order => order.status === 'completed').length;
  const activeSalesmen = new Set(mockOrders.map(order => order.salesman).filter(Boolean)).size;
  
  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    activeSalesmen,
    completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
  };
};

const SalesProgress = () => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{id: string, currentSalesman: string | null} | null>(null);
  const unassignedOrders = mockOrders.filter(order => !order.salesman);
  const stats = calculateStats();

  const handleAssignClick = (orderId: string) => {
    setSelectedOrder({ id: orderId, currentSalesman: null });
    setAssignDialogOpen(true);
  };

  const handleAssign = (salesmanId: number, salesmanName: string) => {
    // Find and update the order with the new salesman
    const updatedOrders = mockOrders.map(order => {
      if (order.id === selectedOrder?.id) {
        return { ...order, salesman: salesmanName };
      }
      return order;
    });
    mockOrders.splice(0, mockOrders.length, ...updatedOrders);
    setAssignDialogOpen(false);
  };

  const handleUnassign = () => {
    if (selectedOrder) {
      // Find and update the order to remove the salesman
      const updatedOrders = mockOrders.map(order => {
        if (order.id === selectedOrder.id) {
          const { salesman, ...rest } = order;
          return rest as typeof order;
        }
        return order;
      });
      mockOrders.splice(0, mockOrders.length, ...updatedOrders);
      setAssignDialogOpen(false);
    }
  };

  // Get list of currently assigned salesmen for other orders
  const assignedSalesmen = Array.from(new Set(
    mockOrders
      .filter(order => order.salesman && order.id !== selectedOrder?.id)
      .map(order => order.salesman as string)
  ));

  console.log("Pending orders test: ",stats.pendingOrders)

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
                <p className="text-base sm:text-xl font-semibold">{mockSalesmen.length}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium">Top Performers</p>
              <div className="space-y-2">
                {mockSalesmen.slice(0, 3).map((salesman) => (
                  <div key={salesman.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarFallback className="text-[10px]">
                          {salesman.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{salesman.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {salesman.activeOrders} active orders
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold whitespace-nowrap ml-2">
                      ${salesman.totalSales.toLocaleString()}
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
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 text-xs h-8 px-2 sm:px-3 w-full sm:w-auto mt-1 sm:mt-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Assign All</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {unassignedOrders.length === 0 ? (
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
                        <p className="text-xs font-medium text-muted-foreground">Order #{order.id}</p>
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
                    <div className="col-span-2 font-medium">{order.id}</div>
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