import { DollarSign, Users, ShoppingCart, Package, Eye, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, type BackendOrder } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

// Using DateRange type from react-day-picker

const PRESETS = [
  { name: 'Today', value: 'today' },
  { name: 'Yesterday', value: 'yesterday' },
  { name: 'Last 7 Days', value: 'last7' },
  { name: 'Last 30 Days', value: 'last30' },
  { name: 'This Month', value: 'thisMonth' },
  { name: 'Last Month', value: 'lastMonth' },
  { name: 'This Year', value: 'thisYear' },
  { name: 'All Time', value: 'all' },
];

const mapStatus = (s?: string): StatusType => {
  if (!s) return 'pending';
  const v = s.toLowerCase();
  if (v === 'completed' || v === 'delivered') return 'completed';
  if (v === 'cancelled' || v === 'canceled') return 'cancelled';
  if (['processing','picked up','picked-up','salesman-assigned','shipped','in_progress'].includes(v)) return 'processing';
  return 'pending';
};

const Dashboard = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(startOfToday(), 6),
    to: startOfToday(),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<string>('last7');
  
  const { data } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  const orders = (data || []) as BackendOrder[];
  
  // Filter orders by date range if specified
  const filteredOrders = date?.from 
    ? orders.filter(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) return false;
        
        // Create new Date objects to avoid modifying the originals
        const fromDate = date.from ? new Date(date.from) : null;
        const toDate = date.to ? new Date(date.to) : null;
        
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);
        
        if (fromDate && toDate) {
          return orderDate >= fromDate && orderDate <= toDate;
        } else if (fromDate) {
          return orderDate >= fromDate;
        } else if (toDate) {
          return orderDate <= toDate;
        }
        return true;
      })
    : orders;

  // Calculate stats from filtered orders
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCustomers = new Set(filteredOrders.map(o => o.customer?.email).filter(Boolean)).size;
  const totalOrders = filteredOrders.length;
  const totalProducts = 0;
  const completedOrders = filteredOrders.filter(o => mapStatus(o.status) === 'completed').length;
  const progressPercent = filteredOrders.length > 0 ? Math.round((completedOrders / filteredOrders.length) * 100) : 0;

  // Prepare a sorted copy for the Recent Orders table (most recent first)
  const recentOrders = ([...filteredOrders]).sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[280px] justify-between text-left font-normal group",
                "hover:bg-accent hover:text-accent-foreground transition-colors"
              )}
            >
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'MMM d, yyyy')} - {format(date.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(date.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </div>
              <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] sm:w-auto p-0" align="end">
            <div className="flex flex-col sm:flex-row">
              <div className="p-3 border-b sm:border-b-0 sm:border-r">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                  {PRESETS.map((presetItem) => (
                    <Button
                      key={presetItem.value}
                      variant="ghost"
                      className={cn(
                        'justify-start text-left text-sm',
                        preset === presetItem.value && 'bg-accent font-medium'
                      )}
                      onClick={() => {
                        const today = startOfToday();
                        switch (presetItem.value) {
                          case 'today':
                            setDate({ from: today, to: endOfToday() });
                            break;
                          case 'yesterday':
                            const yesterday = subDays(today, 1);
                            setDate({ from: yesterday, to: yesterday });
                            break;
                          case 'last7':
                            setDate({ from: subDays(today, 6), to: today });
                            break;
                          case 'last30':
                            setDate({ from: subDays(today, 29), to: today });
                            break;
                          case 'thisMonth':
                            setDate({ from: startOfMonth(today), to: endOfMonth(today) });
                            break;
                          case 'lastMonth':
                            const firstDayOfLastMonth = startOfMonth(subDays(today, today.getDate()));
                            setDate({ from: firstDayOfLastMonth, to: endOfMonth(firstDayOfLastMonth) });
                            break;
                          case 'thisYear':
                            setDate({ from: startOfYear(today), to: today });
                            break;
                          case 'all':
                            setDate({ from: undefined, to: undefined });
                            break;
                        }
                        setPreset(presetItem.value);
                        setIsOpen(false);
                      }}
                    >
                      {presetItem.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={(range: DateRange | undefined) => {
                    if (range?.from) {
                      setDate(range);
                      setPreset('custom');
                    }
                  }}
                  defaultMonth={date?.from}
                  numberOfMonths={1}
                  className="border-0"
                  classNames={{
                    day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    day_today: 'bg-accent text-accent-foreground',
                  }}
                />
                <div className="flex justify-end p-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setDate({ from: undefined, to: undefined });
                      setPreset('all');
                      setIsOpen(false);
                    }}
                    className="text-xs h-8"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
              <div className="flex items-center justify-between mb-4">
                <p className="text-3xl font-bold text-foreground">
                  {completedOrders} / {totalOrders}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">Sales Progress</p>
                <span className="text-lg font-semibold text-foreground">
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
