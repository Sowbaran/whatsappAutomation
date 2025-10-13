import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Package, Clock, RefreshCw, Edit, ShoppingCart, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockOrders } from '@/lib/mockData';
import { UpdateStatusDialog } from '@/components/orders/UpdateStatusDialog';
import { EditOrderDialog } from '@/components/orders/EditOrderDialog';
import { EditPaymentDialog } from '@/components/orders/EditPaymentDialog';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderItem {
  id: string | number;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  shipping: number;
  tax: number;
  overallDiscount: number;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  addresses?: {
    shipping?: Address;
    billing?: Address;
  };
  payment?: {
    method: string;
    status: string;
    transactionId?: string;
    [key: string]: any;
  };
  history?: Array<{
    status: string;
    date: string;
    note: string;
  }>;
  salesman?: string;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromDashboard = location.state?.from === 'dashboard';
  const [order, setOrder] = useState<Order | null>(() => {
    const foundOrder = mockOrders.find((o: any) => o.id === id);
    return foundOrder ? { ...foundOrder } : null;
  });
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [tempDiscount, setTempDiscount] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{id: string | number, discount: number}>>([]);

  // Map status to valid StatusType
  const getStatusType = (status: string): StatusType => {
    const validStatuses: StatusType[] = ['pending', 'processing', 'completed', 'cancelled', 'active', 'inactive'];
    return validStatuses.includes(status as StatusType) ? status as StatusType : 'pending';
  };

  useEffect(() => {
    if (order) {
      setOrderItems(order.items.map(item => ({
        id: item.id,
        discount: item.discount || 0
      })));
    }
  }, [order]);

  const handleDiscountChange = (value: string) => {
    // Allow only numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTempDiscount(value);
    }
  };

  const saveDiscount = (itemId: string) => {
    const discountValue = parseFloat(tempDiscount) || 0;
    const item = order?.items.find(item => item.id.toString() === itemId);
    if (!item) return;

    if (discountValue < 0) {
      toast({
        title: 'Error',
        description: 'Discount cannot be negative',
        variant: 'destructive',
      });
      return;
    }

    if (discountValue > (item.price * item.quantity)) {
      toast({
        title: 'Error',
        description: 'Discount cannot be greater than item price',
        variant: 'destructive',
      });
      return;
    }

    const updatedItems = orderItems.map(item => 
      item.id.toString() === itemId ? { ...item, discount: discountValue } : item
    );
    
    setOrderItems(updatedItems);
    
    if (order) {
      const updatedOrder = {
        ...order,
        items: order.items.map(item => {
          const updatedItem = updatedItems.find(i => i.id.toString() === item.id.toString());
          return {
            ...item,
            discount: updatedItem ? updatedItem.discount || 0 : 0
          };
        })
      };
      
      // Recalculate total
      const subtotal = updatedOrder.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = item.discount || 0;
        return sum + (itemTotal - itemDiscount);
      }, 0);
      
      updatedOrder.total = subtotal + (updatedOrder.shipping || 0) + (updatedOrder.tax || 0) - (updatedOrder.overallDiscount || 0);
      
      setOrder(updatedOrder);
    }
    
    setEditingDiscount(null);
    setTempDiscount('');
  };

  const calculateItemTotal = (price: number, quantity: number, discount: number = 0): string => {
    return (price * quantity - discount).toFixed(2);
  };

  const calculateSubtotal = (): string => {
    if (!order) return '0.00';
    return order.items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = item.discount || 0;
      return sum + (itemTotal - itemDiscount);
    }, 0).toFixed(2);
  };

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(fromDashboard ? '/' : '/orders')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setIsUpdateDialogOpen(true)}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Information</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <StatusBadge status={getStatusType(order.status)} />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                {order.salesman && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Salesperson:</span>
                    <span className="text-sm font-medium">{order.salesman}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.customer.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">{order.customer.email}</div>
              <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full relative group">
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 h-8 px-3 py-1.5 rounded-md shadow-sm"
              onClick={() => setIsEditPaymentOpen(true)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Edit Payment</span>
            </Button>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Method:</span>
                <span className="text-sm font-medium text-right">
                  {order.payment?.method || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={getStatusType(order.payment?.status || 'pending')} />
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="text-sm font-medium">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Order Items</h3>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          onClick={() => setIsEditOrderOpen(true)}
        >
          <Edit className="h-4 w-4" />
          <span>Edit Order</span>
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Discount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 px-4">
                      <div className="font-medium">{item.name}</div>
                      {item.sku && <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>}
                    </td>
                    <td className="py-4 px-4 text-right">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">
                      {editingDiscount === item.id.toString() ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Input
                            type="text"
                            value={tempDiscount}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            className="w-24 text-right"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveDiscount(item.id.toString())}
                            disabled={tempDiscount === ''}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingDiscount(null);
                              setTempDiscount('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <span>${(item.discount || 0).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setEditingDiscount(item.id.toString());
                              setTempDiscount(item.discount?.toString() || '');
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-medium">
                      ${calculateItemTotal(item.price, item.quantity, item.discount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right py-3 px-4 text-sm font-medium">Subtotal</td>
                  <td className="py-3 px-4 text-right font-medium">${calculateSubtotal()}</td>
                </tr>
                {order.shipping > 0 && (
                  <tr>
                    <td colSpan={4} className="text-right py-3 px-4 text-sm font-medium">Shipping</td>
                    <td className="py-3 px-4 text-right">${order.shipping.toFixed(2)}</td>
                  </tr>
                )}
                {order.tax > 0 && (
                  <tr>
                    <td colSpan={4} className="text-right py-3 px-4 text-sm font-medium">Tax</td>
                    <td className="py-3 px-4 text-right">${order.tax.toFixed(2)}</td>
                  </tr>
                )}
                {order.overallDiscount > 0 && (
                  <tr>
                    <td colSpan={4} className="text-right py-3 px-4 text-sm font-medium text-red-500">Discount</td>
                    <td className="py-3 px-4 text-right text-red-500">-${order.overallDiscount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="border-t">
                  <td colSpan={4} className="py-3 px-4 text-right text-lg font-bold">Total</td>
                  <td className="py-3 px-4 text-right text-lg font-bold">${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {order.addresses?.shipping && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div>{order.addresses.shipping.street}</div>
                <div>{order.addresses.shipping.city}, {order.addresses.shipping.state} {order.addresses.shipping.postalCode}</div>
                <div>{order.addresses.shipping.country}</div>
                {order.addresses.shipping.phone && <div>Phone: {order.addresses.shipping.phone}</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {order.addresses?.billing && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div>{order.addresses.billing.street}</div>
                <div>{order.addresses.billing.city}, {order.addresses.billing.state} {order.addresses.billing.postalCode}</div>
                <div>{order.addresses.billing.country}</div>
                {order.addresses.billing.phone && <div>Phone: {order.addresses.billing.phone}</div>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {order.history && order.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.history.map((entry, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">
                      <StatusBadge status={getStatusType(entry.status)} className="mr-2" />
                      {new Date(entry.date).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{entry.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <UpdateStatusDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        orderId={order.id}
        onStatusUpdate={(newStatus) => {
          setOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }}
      />

      <EditOrderDialog
        open={isEditOrderOpen}
        onOpenChange={setIsEditOrderOpen}
        order={order}
        onSave={(items, shipping, tax, overallDiscount) => {
          setOrder(prev => prev ? {
            ...prev,
            items,
            shipping,
            tax,
            overallDiscount,
            // Recalculate total
            total: items.reduce((sum, item) => {
              const itemTotal = item.price * item.quantity;
              const itemDiscount = item.discount || 0;
              return sum + (itemTotal - itemDiscount);
            }, 0) + shipping + tax - overallDiscount
          } : null);
          setIsEditOrderOpen(false);
        }}
      />

      <EditPaymentDialog
        open={isEditPaymentOpen}
        onOpenChange={setIsEditPaymentOpen}
        order={order}
        onSave={(paymentDetails) => {
          setOrder(prev => prev ? {
            ...prev,
            payment: {
              ...prev.payment,
              ...paymentDetails
            }
          } : null);
          setIsEditPaymentOpen(false);
        }}
      />

      {/* Confirmation Dialog for Payment Edit */}
      <Dialog open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Details</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the payment information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPaymentOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Handle payment update logic here
                setIsEditPaymentOpen(false);
                // Show success message
                toast({
                  title: "Success",
                  description: "Payment information updated successfully.",
                });
              }}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails;