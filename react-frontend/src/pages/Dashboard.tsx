import { DollarSign, Users, ShoppingCart, Package, Eye } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, type BackendOrder } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

const mapStatus = (s?: string): StatusType => {
  if (!s) return 'pending';
  const v = s.toLowerCase();
  if (v === 'completed' || v === 'delivered') return 'completed';
  if (v === 'cancelled' || v === 'canceled') return 'cancelled';
  if (['processing','picked up','picked-up','salesman-assigned','shipped','in_progress'].includes(v)) return 'processing';
  return 'pending';
};

const Dashboard = () => {
  const { data } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  const orders = (data || []) as BackendOrder[];
  // Prepare a sorted copy for the Recent Orders table (most recent first)
  const recentOrders = ([...orders]).sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCustomers = new Set(orders.map(o => o.customer?.email).filter(Boolean)).size;
  const totalOrders = orders.length;
  const totalProducts = 0;

  const completedOrders = orders.filter(o => mapStatus(o.status) === 'completed').length;
  const progressPercent = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: '12.5%', positive: true }}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          trend={{ value: '8.2%', positive: true }}
          iconColor="text-secondary"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          trend={{ value: '3.1%', positive: false }}
          iconColor="text-success"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          iconColor="text-warning"
        />
        {/* Sales Progress Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Sales Progress</p>
              </div>
              <div className="flex items-end justify-between mb-2">
                <p className="text-3xl font-bold text-foreground">
                  {completedOrders} / {totalOrders}
                </p>
                <span className="text-sm font-medium text-muted-foreground">
                  {progressPercent}% Completed
                </span>
              </div>
              <div>
                <Progress value={progressPercent} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 font-medium">{o.orderId}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{o.customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{o.customer?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{o.createdAt ? new Date(o.createdAt).toISOString().slice(0,10) : ''}</td>
                    <td className="py-4 px-4 font-semibold">₹{(o.totalAmount || 0).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={mapStatus(o.status)} />
                    </td>
                    <td className="py-4 px-4">
                      <Link 
                        to={`/orders/${o.orderId}`}
                        state={{ from: 'dashboard' }}
                      >
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
