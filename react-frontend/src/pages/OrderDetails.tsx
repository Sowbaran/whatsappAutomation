import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, DollarSign, Package, User, Edit, Printer, CreditCard, Clock, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";
import { fetchOrderByOrderId, updateOrder } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/ConfirmDialog";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [productsDialog, setProductsDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "status" | "payment" | "products" }>({ open: false, type: "status" });
  const [isConfirming, setIsConfirming] = useState(false); // Track if we are in a confirmation flow
  const [statusForm, setStatusForm] = useState({ status: 'pending' as OrderStatus, note: "" });
  const [paymentForm, setPaymentForm] = useState({ paymentStatus: 'pending' as PaymentStatus, paymentMethod: 'credit_card' as PaymentMethod });
  const [itemsForm, setItemsForm] = useState<OrderItem[]>([]);
  
  // State for editable order summary
  const [editableOrder, setEditableOrder] = useState({
    tax: order?.tax || 0,
    shipping: order?.shipping || 0,
    overallDiscount: order?.discount || 0
  });
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // Fetch order data from backend
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const backendOrder = await fetchOrderByOrderId(id);
        if (!backendOrder) {
          setError("Order not found");
          setLoading(false);
          return;
        }

        // Map backend order to frontend order format
        const mappedOrder: Order = {
          id: backendOrder._id,
          orderNumber: backendOrder.orderId || backendOrder._id,
          customer: {
            id: backendOrder._id,
            name: backendOrder.customer?.name || '',
            email: backendOrder.customer?.email || '',
            address: backendOrder.customer?.shippingAddress || backendOrder.customer?.billingAddress || '',
            phone: backendOrder.customer?.phone || '',
          },
          date: backendOrder.createdAt || new Date().toISOString(),
          items: (backendOrder.products || []).map((p, idx) => ({
            id: String(idx + 1),
            sku: p.sku || String(idx + 1),
            name: p.product,
            price: p.price,
            quantity: p.quantity,
            discount: 0,
          })),
          subtotal: (backendOrder.products || []).reduce((sum, p) => sum + p.price * p.quantity, 0),
          tax: 0,
          shipping: 0,
          discount: 0,
          total: backendOrder.totalAmount || 0,
          salesman: typeof backendOrder.salesman === 'object' && backendOrder.salesman && 'name' in backendOrder.salesman ? (backendOrder.salesman.name as string) : undefined,
          status: (backendOrder.status as any) || 'pending',
          payment: {
            status: (backendOrder.payment?.status as any) || 'pending',
            method: (backendOrder.payment?.method as any) || 'credit_card',
            amount: backendOrder.totalAmount || 0,
            date: backendOrder.createdAt || new Date().toISOString(),
          },
          history: (backendOrder.timeline || []).map((t, i) => ({
            id: `H${i+1}`,
            date: t.date || new Date().toISOString(),
            status: (t.action as any) || 'pending',
            updatedBy: t.updatedBy || 'System',
            note: t.description || '',
          })),
        };

        setOrder(mappedOrder);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Update editable order when order changes
  useEffect(() => {
    if (order) {
      setEditableOrder({
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        overallDiscount: order.discount || 0
      });
      setItemsForm(order.items);
      setStatusForm({
        status: order.status || 'pending',
        note: ""
      });
      setPaymentForm({
        paymentStatus: order.payment?.status || 'pending',
        paymentMethod: order.payment?.method || 'credit_card'
      });
    }
  }, [order]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Error Loading Order</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/orders")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Orders
        </Button>
      </div>
    );
  }

  // Show not found state
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Order Not Found</h2>
        <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/orders")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Orders
        </Button>
      </div>
    );
  }

  const orderDate = new Date(order.date).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  // Handle order summary changes
  const handleOrderSummaryChange = (field: 'tax' | 'shipping' | 'overallDiscount', value: number) => {
    setEditableOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save order summary changes
  const handleSaveOrderSummary = () => {
    if (!order) return;
    const subtotal = itemsForm.reduce((sum, p) => sum + (p.price * p.quantity) - (p.discount || 0), 0);
    const total = subtotal - editableOrder.overallDiscount + editableOrder.tax + editableOrder.shipping;
    
    setOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tax: editableOrder.tax,
        shipping: editableOrder.shipping,
        discount: editableOrder.overallDiscount,
        subtotal,
        total: total
      }
    });
    
    setIsEditingSummary(false);
    toast.success("Order summary updated successfully!");
  };

  const handlePrint = () => { 
    window.print(); 
    toast.success("Print dialog opened"); 
  };

  const openStatusDialog = () => { 
    setStatusForm({ status: order.status, note: "" }); 
    setStatusDialog(true); 
  };

  const openPaymentDialog = () => { 
    setPaymentForm({ paymentStatus: order.payment.status, paymentMethod: order.payment.method }); 
    setPaymentDialog(true); 
  };

  const openProductsDialog = () => { 
    setItemsForm([...order.items]); 
    setProductsDialog(true); 
  };

  const handleStatusSubmit = () => { 
    setStatusDialog(false); 
    setIsConfirming(true); // Start confirmation flow
    setConfirmDialog({ open: true, type: "status" }); 
  };

  const handlePaymentSubmit = () => { 
    setPaymentDialog(false); 
    setIsConfirming(true); // Start confirmation flow
    setConfirmDialog({ open: true, type: "payment" }); 
  };

  const handleProductsSubmit = () => { 
    if (!order) return;
    setProductsDialog(false);
    setIsConfirming(true); // Start confirmation flow
    setConfirmDialog({ open: true, type: "products" });
  };

  const confirmUpdate = async () => {
    if (!order) return;
    
    const type = confirmDialog.type;
    try {
      let updateData: any = {};
      
      if (type === "status") {
        updateData = {
          status: statusForm.status,
          statusChangeReason: statusForm.note || `Status changed to ${statusForm.status}`
        };
      } else if (type === "payment") {
        updateData = {
          payment: {
            status: paymentForm.paymentStatus,
            method: paymentForm.paymentMethod
          }
        };
      } else if (type === "products") {
        // Map frontend items back to backend format
        updateData = {
          products: itemsForm.map(item => ({
            product: item.name,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity
          }))
        };
      }

      // Call backend API to update the order
      const updatedOrder = await updateOrder(order.id, updateData);
      
      // Update local state with the response from backend
      if (updatedOrder) {
        const mappedOrder: Order = {
          id: updatedOrder._id,
          orderNumber: updatedOrder.orderId || updatedOrder._id,
          customer: {
            id: updatedOrder._id,
            name: updatedOrder.customer?.name || '',
            email: updatedOrder.customer?.email || '',
            address: updatedOrder.customer?.shippingAddress || updatedOrder.customer?.billingAddress || '',
            phone: updatedOrder.customer?.phone || '',
          },
          date: updatedOrder.createdAt || new Date().toISOString(),
          items: (updatedOrder.products || []).map((p, idx) => ({
            id: String(idx + 1),
            sku: p.sku || String(idx + 1),
            name: p.product,
            price: p.price,
            quantity: p.quantity,
            discount: 0,
          })),
          subtotal: (updatedOrder.products || []).reduce((sum, p) => sum + p.price * p.quantity, 0),
          tax: 0,
          shipping: 0,
          discount: 0,
          total: updatedOrder.totalAmount || 0,
          salesman: typeof updatedOrder.salesman === 'object' && updatedOrder.salesman && 'name' in updatedOrder.salesman ? (updatedOrder.salesman.name as string) : undefined,
          status: (updatedOrder.status as any) || 'pending',
          payment: {
            status: (updatedOrder.payment?.status as any) || 'pending',
            method: (updatedOrder.payment?.method as any) || 'credit_card',
            amount: updatedOrder.totalAmount || 0,
            date: updatedOrder.createdAt || new Date().toISOString(),
          },
          history: (updatedOrder.timeline || []).map((t, i) => ({
            id: `H${i+1}`,
            date: t.date || new Date().toISOString(),
            status: (t.action as any) || 'pending',
            updatedBy: t.updatedBy || 'System',
            note: t.description || '',
          })),
        };
        
        setOrder(mappedOrder);
      }
      
      // Show success message
      const successMessage = type === "status" 
        ? "Order status updated successfully!" 
        : type === "payment" 
          ? "Payment information updated successfully!" 
          : "Products updated successfully!";
      toast.success(successMessage);
      
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order. Please try again.");
    } finally {
      // Close all dialogs
      setConfirmDialog({ open: false, type: confirmDialog.type });
      setStatusDialog(false);
      setPaymentDialog(false);
      setProductsDialog(false);
      setIsConfirming(false);
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...itemsForm];
    updated[index] = { ...updated[index], [field]: value };
    setItemsForm(updated);
  };

  const calculateItemTotal = (item: OrderItem) => (item.price * item.quantity) - (item.discount || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handlePrint} className="bg-card hover:bg-muted">
            <Printer className="w-4 h-4 mr-2" />Print
          </Button>
          <Button onClick={openStatusDialog} className="bg-warning hover:bg-warning/90 text-white">
            <Edit className="w-4 h-4 mr-2" />Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <Card className="p-6 relative">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />Customer Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">Customer</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />Phone Number
              </p>
              <p className="font-semibold text-foreground">{order.customer.phone}</p>
            </div>
            {order.customer.email && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />Email Address
                </p>
                <p className="font-semibold text-foreground">{order.customer.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />Shipping Address
              </p>
              <p className="font-semibold text-foreground">{order.customer.address}</p>
            </div>
          </div>
        </Card>

        {/* Order Information Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />Order Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />Order Date
              </p>
              <p className="font-semibold text-foreground">{orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Status</p>
              <StatusBadge status={order.status} />
            </div>
            {order.salesman && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned Salesman</p>
                <p className="font-semibold text-foreground">{order.salesman}</p>
              </div>
            )}
            {order.region && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Region</p>
                <p className="font-semibold text-foreground">{order.region}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Information Card */}
        <Card className="p-6 relative">
          <Button size="sm" variant="ghost" onClick={openPaymentDialog} className="absolute top-4 right-4">
            <Edit className="w-4 h-4 mr-1" />Edit
          </Button>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />Payment Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
              <StatusBadge status={order.payment.status} />
            </div>
            {order.payment.method && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold text-foreground">{order.payment.method}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="font-bold text-2xl text-primary">₹{order.total.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Products Card */}
        <Card className="p-6 relative">
          <Button size="sm" variant="ghost" onClick={openProductsDialog} className="absolute top-4 right-4">
            <Edit className="w-4 h-4 mr-1" />Edit
          </Button>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />Products
          </h2>
          
          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="font-bold text-foreground">₹{calculateItemTotal(item).toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Qty: {item.quantity}</span>
                  <span>Price: ₹{item.price.toFixed(2)}</span>
                  {item.discount && item.discount > 0 && (
                    <span className="col-span-2 text-danger">Discount: -₹{item.discount.toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Product Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Discount</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-foreground">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-danger">
                      {item.discount && item.discount > 0 ? `-₹${item.discount.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary - Editable Section */}
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold">₹{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            
            {/* Overall Discount - Editable */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Overall Discount</span>
              {isEditingSummary ? (
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableOrder.overallDiscount}
                    onChange={(e) => handleOrderSummaryChange('overallDiscount', parseFloat(e.target.value) || 0)}
                    className="pl-6 text-right"
                  />
                </div>
              ) : (
                <span className="text-danger font-semibold">-₹{(order.discount || 0).toFixed(2)}</span>
              )}
            </div>

            {/* Tax - Editable */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tax</span>
              {isEditingSummary ? (
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableOrder.tax}
                    onChange={(e) => handleOrderSummaryChange('tax', parseFloat(e.target.value) || 0)}
                    className="pl-6 text-right"
                  />
                </div>
              ) : (
                <span className="font-semibold">₹{(order.tax || 0).toFixed(2)}</span>
              )}
            </div>

            {/* Shipping - Editable */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Shipping</span>
              {isEditingSummary ? (
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableOrder.shipping}
                    onChange={(e) => handleOrderSummaryChange('shipping', parseFloat(e.target.value) || 0)}
                    className="pl-6 text-right"
                  />
                </div>
              ) : (
                <span className="font-semibold">₹{(order.shipping || 0).toFixed(2)}</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-foreground">
                <DollarSign className="w-5 h-5" />
                <span className="text-lg font-semibold">Total Amount</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ₹{order.total.toFixed(2)}
              </span>
            </div>

            {/* Edit/Save buttons */}
            <div className="flex justify-end pt-2">
              {isEditingSummary ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsEditingSummary(false);
                      // Reset to original values if cancelled
                      setEditableOrder({
                        tax: order.tax || 0,
                        shipping: order.shipping || 0,
                        overallDiscount: order.discount || 0
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveOrderSummary}
                  >
                    <Save className="w-4 h-4 mr-1" /> Save Changes
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditingSummary(true);
                    // Initialize editable fields with current values
                    setEditableOrder({
                      tax: order.tax || 0,
                      shipping: order.shipping || 0,
                      overallDiscount: order.discount || 0
                    });
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit Summary
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Order History */}
      {order.history && order.history.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />Order History
          </h2>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/30"></div>
            {order.history.map((item, index) => (
              <div key={item.id || index} className="relative">
                <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-primary"></div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-foreground">{item.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric", 
                        year: "numeric", 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Updated by: {item.updatedBy}
                  </p>
                  {item.note && (
                    <p className="text-sm text-foreground">Note: {item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialog} 
        onOpenChange={setStatusDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select 
                value={statusForm.status} 
                onValueChange={(value) => setStatusForm({ ...statusForm, status: value as OrderStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea 
                placeholder="Enter a note for this status change" 
                value={statusForm.note} 
                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button onClick={handleStatusSubmit}>
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialog} 
        onOpenChange={setPaymentDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select 
                value={paymentForm.paymentStatus} 
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentStatus: value as PaymentStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={paymentForm.paymentMethod} 
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value as PaymentMethod })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button onClick={handlePaymentSubmit}>
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Dialog */}
      <Dialog open={productsDialog} onOpenChange={setProductsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {itemsForm.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input 
                      value={item.name} 
                      onChange={(e) => updateItem(index, "name", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price (₹)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={item.price} 
                      onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (₹)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={item.discount || 0} 
                      onChange={(e) => updateItem(index, "discount", parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="col-span-full flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Product Total:</span>
                    <span className="font-bold text-lg">₹{calculateItemTotal(item).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductsDialog(false)}>
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button onClick={handleProductsSubmit}>
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => {
          setConfirmDialog({ ...confirmDialog, open });
          // This logic handles cancellation ("Cancel", "X", Esc)
          if (!open && isConfirming) {
            if (confirmDialog.type === "status") {
              setStatusDialog(true); // Re-open status dialog
            } else if (confirmDialog.type === "payment") {
              setPaymentDialog(true); // Re-open payment dialog
            }
            setIsConfirming(false); // Reset on cancel
          }
        }}
        title="Confirm Changes" 
        description={
          confirmDialog.type === "status" 
            ? `Are you sure you want to update the order status to "${statusForm.status}"?` 
            : confirmDialog.type === "payment" 
              ? "Are you sure you want to update the payment information?" 
              : "Are you sure you want to update the products?"
        } 
        onConfirm={confirmUpdate} 
        confirmText="Yes, Update" 
      />
    </div>
  );
};

export default OrderDetails;