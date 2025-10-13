import { DollarSign, Users, ShoppingCart, Package, Eye } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockOrders } from '@/lib/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCustomers = new Set(mockOrders.map(o => o.customer.email)).size;
  const totalOrders = mockOrders.length;
  const totalProducts = 156;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
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
                {mockOrders.map((order) => (
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
                      <Link 
                        to={`/orders/${order.id}`}
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
