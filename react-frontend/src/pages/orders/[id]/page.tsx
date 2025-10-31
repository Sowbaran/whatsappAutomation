import { notFound } from 'next/navigation';
import { mockOrders } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, User, Mail, Phone, MapPin, Calendar, Clock, CreditCard, Printer } from 'lucide-react';
import Link from 'next/link';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'shipped';

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  completed: 'default',
  shipped: 'default',
  cancelled: 'destructive',
};

export default function OrderDetails({ params }: { params: { id: string } }) {
  const order = mockOrders.find(order => order.id === params.id);
  
  if (!order) {
    notFound();
  }

  const calculateSubtotal = () => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + order.tax + order.shipping - (order.overallDiscount || 0);
  };

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
          <Link href="/orders">
            <Button variant="ghost" className="mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button>
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{order.customer.name}</h3>
                <p className="text-sm text-muted-foreground">Customer</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(order as any).shippingAddress || 'No shipping address provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" /> Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="text-sm font-medium">{order.payment?.method || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={order.payment?.status?.toLowerCase() === 'paid' ? 'default' : 'secondary'}>
                  {order.payment?.status || 'N/A'}
                </Badge>
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="text-sm font-mono">{order.payment.transactionId}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between gap-4 py-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
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

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {order.overallDiscount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span>-₹{order.overallDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" /> Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />
                <div className="space-y-6">
                  {order.history.map((event, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-0 w-3 h-3 rounded-full bg-primary mt-1" />
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{event.status}</h4>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(event.date).split(', ')[1]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.note}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.date).split(', ')[0]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
