import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, CreditCard, Edit, Package, Printer, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/lib/mockData';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'shipped';

const statusVariant = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  shipped: 'bg-purple-100 text-purple-800',
};

export default function AdminOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the order data here
    const foundOrder = mockOrders.find((o: any) => o.id === params.id);
    if (foundOrder) {
      setOrder({
        ...foundOrder,
        customerName: foundOrder.customer?.name || 'N/A',
        customerEmail: foundOrder.customer?.email || 'N/A',
        customerPhone: foundOrder.customer?.phone || 'N/A',
        paymentStatus: foundOrder.payment?.status || 'unpaid',
        paymentMethod: foundOrder.payment?.method || 'N/A',
      });
    }
    setIsLoading(false);
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5" /> Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Order Date
              </p>
              <p className="font-medium">{formatDate(order.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge className={statusVariant[order.status as OrderStatus] || 'bg-gray-100 text-gray-800'}>
                {order.status}
              </Badge>
            </div>
            {order.salesman && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned Salesman</p>
                <p className="font-medium">{order.salesman}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" /> Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{order.customerName}</h3>
              <p className="text-sm text-muted-foreground">Customer</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Phone:</span>
                <span>{order.customerPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5" /> Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span>{order.paymentMethod}</span>
            </div>
            {order.payment?.transactionId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">{order.payment.transactionId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5" /> Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    {item.discount > 0 && (
                      <p className="text-sm text-muted-foreground line-through">
                        ₹{(item.price * item.quantity + item.discount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              {order.overallDiscount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount</span>
                  <span>-₹{order.overallDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{order.shipping?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>Total</span>
                <span>₹{order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" /> Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />
              <div className="space-y-6">
                {order.history?.map((event: any, index: number) => (
                  <div key={index} className="relative pl-10">
                    <div className="absolute left-0 w-3 h-3 rounded-full bg-primary mt-1" />
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{event.status}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
