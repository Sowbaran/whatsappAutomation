import { useState } from 'react';
import { UserPlus, TrendingUp, Users, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sales performance and order status</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Orders Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Orders Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-semibold">{stats.pendingOrders}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-xl font-semibold">{stats.processingOrders}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold">{stats.completedOrders}</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-lg font-semibold">{stats.totalOrders}</p>
              </div>
              <div className="mt-1">
                <Progress value={stats.completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completionRate}% completion rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Team */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Sales Team</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-semibold">{stats.activeSalesmen}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Team</p>
                  <p className="text-2xl font-semibold">{mockSalesmen.length}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Top Performers</p>
                <div className="space-y-3">
                  {mockSalesmen.slice(0, 3).map((salesman) => (
                    <div key={salesman.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {salesman.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{salesman.name}</p>
                          <p className="text-xs text-muted-foreground">{salesman.activeOrders} active orders</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">${salesman.totalSales.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Unassigned Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unassigned Orders</CardTitle>
              <CardDescription>
                {unassignedOrders.length} orders waiting to be assigned to sales representatives
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Assign All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>All orders have been assigned to salesmen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 font-medium">{order.id}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{order.date}</td>
                      <td className="py-4 px-4 font-semibold">${order.total.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleAssignClick(order.id)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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