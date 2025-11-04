import { useMemo, useState } from 'react';
import CustomerDialog from '@/components/CustomerDialog';
import { Search, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomers, fetchOrders, type BackendCustomer, type BackendOrder } from '@/lib/api';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: customersData } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
  const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  const orders = (ordersData || []) as BackendOrder[];
  const customers = useMemo(() => {
    const cs = (customersData || []) as BackendCustomer[];
    return cs.map((c, idx) => {
      const relatedOrders = orders.filter(o => o.customer?.email && c.email && o.customer.email === c.email);
      const totalSpent = relatedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        id: c._id || idx + 1,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        orders: relatedOrders.length,
        totalSpent,
        joinedDate: c.createdAt ? new Date(c.createdAt).toISOString().slice(0,10) : '',
      };
    });
  }, [customersData, orders]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Customers Management</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">All Customers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total Spent</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDialogOpen(true);
                    }}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {customer.orders} orders
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-success">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm">{customer.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Customer Dialog */}
      {selectedCustomer && (
        <CustomerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          customer={selectedCustomer}
          orders={(orders || []).map(o => ({
            customer: {
              email: o.customer?.email || '',
              name: o.customer?.name || '',
              phone: o.customer?.phone || '',
            },
            total: o.totalAmount || 0,
            payment: { status: o.payment?.status || 'unpaid', method: o.payment?.method || '-' }
          }))}
          onSave={(updatedCustomer) => {
            // Update the selected customer to reflect changes in the dialog
            setSelectedCustomer(updatedCustomer);
            // Note: The customers list will automatically update on next data refresh from React Query
          }}
        />
      )}
    </div>
  );
};

export default Customers;
