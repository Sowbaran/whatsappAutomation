import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, DollarSign, Package, User, Edit, Printer, CreditCard, Clock, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Order } from "@/types/order";
import { fetchOrderByIdOrOrderId, updateOrder } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/ConfirmDialog";

// Custom layout component without sidebar and header
const OrderDetailsLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <div className="p-4">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      {children}
    </div>
  </div>
);

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [productsDialog, setProductsDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "status" | "payment" | "products" }>({ open: false, type: "status" });
  const [isConfirming, setIsConfirming] = useState(false); // Track if we are in a confirmation flow
  const [statusForm, setStatusForm] = useState({ status: 'pending', reason: "", purpose: "" });
  const [paymentForm, setPaymentForm] = useState({ paymentStatus: 'unpaid', paymentMethod: '' });
  
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
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching order with ID:', orderId);
        
        const backendOrder = await fetchOrderByIdOrOrderId(orderId).catch(err => {
          console.error('API Error:', err);
          throw err;
        });
        
        console.log('Backend order response:', backendOrder);
        
        if (!backendOrder) {
          console.error('No order data received from backend');
          setError("Order not found");
          setLoading(false);
          return;
        }

        // Map backend order to frontend order format
        const mappedOrder: Order = {
          id: backendOrder._id,
          customerName: backendOrder.customer?.name || '',
          customerPhone: backendOrder.customer?.phone || '',
          customerEmail: backendOrder.customer?.email || '',
          customerAddress: backendOrder.customer?.shippingAddress || backendOrder.customer?.billingAddress || '',
          billingAddress: backendOrder.customer?.billingAddress || '',
          products: (backendOrder.products || []).map((p, idx) => ({
            id: String(idx + 1),
            name: p.product,
            price: p.price,
            quantity: p.quantity,
            discount: p.discount || 0,
          })),
          subtotal: (backendOrder.products || []).reduce((sum, p) => sum + p.price * p.quantity - (p.discount || 0), 0),
          tax: backendOrder.tax || 0,
          shipping: backendOrder.shipping || 0,
          discount: backendOrder.discount || 0,
          totalAmount: backendOrder.totalAmount || 0,
          salesman: typeof backendOrder.salesman === 'object' && backendOrder.salesman && 'name' in backendOrder.salesman ? (backendOrder.salesman.name as string) : undefined,
          status: (backendOrder.status as Order["status"]) || 'pending',
          paymentStatus: (backendOrder.payment?.status as Order["paymentStatus"]) || 'unpaid',
          paymentMethod: backendOrder.payment?.method || '',
          orderDate: backendOrder.createdAt || new Date().toISOString(),
          history: (backendOrder.timeline || []).map((t, i) => ({
            id: `H${i+1}`,
            date: t.date || new Date().toISOString(),
            status: t.action || 'pending',
            updatedBy: t.updatedBy || 'System',
            reason: t.statusChangeReason || '',
            purpose: t.statusRemarks || '',
            description: t.description || '',
          })),
        };

        console.log('Mapped order:', mappedOrder);
        setOrder(mappedOrder);
      } catch (err) {
        console.error("Error in fetchOrder:", err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Update editable order when order changes
  useEffect(() => {
    if (order) {
      setEditableOrder({
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        overallDiscount: order.discount || 0
      });
      setStatusForm({
        status: order.status || 'pending',
        reason: "",
        purpose: ""
      });
      setPaymentForm({
        paymentStatus: order.paymentStatus || 'unpaid',
        paymentMethod: order.paymentMethod || ''
      });
    }
  }, [order]);

  // Recalculate totalAmount whenever products, tax, shipping, or discount change
  useEffect(() => {
    if (order) {
      const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity) - (p.discount || 0), 0);
      const total = subtotal - (order.discount || 0) + (order.tax || 0) + (order.shipping || 0);
      
      // Only update if the calculated total is different from current totalAmount
      if (Math.abs(total - order.totalAmount) > 0.01) {
        setOrder(prev => {
          if (!prev) return prev;
          return { ...prev, totalAmount: total, subtotal };
        });
      }
    }
  }, [order?.products, order?.tax, order?.shipping, order?.discount]);

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
        <Button onClick={() => navigate("/")} className="mt-4">
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
        <Button onClick={() => navigate("/")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Orders
        </Button>
      </div>
    );
  }

  const orderDate = new Date(order.orderDate).toLocaleDateString("en-US", { 
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
  const handleSaveOrderSummary = async () => {
    if (!order) return;
    const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity) - (p.discount || 0), 0);
    const total = subtotal - editableOrder.overallDiscount + editableOrder.tax + editableOrder.shipping;
    
    try {
      // Update backend first
      const updateData = {
        tax: editableOrder.tax,
        shipping: editableOrder.shipping,
        discount: editableOrder.overallDiscount,
        totalAmount: total
      };
      
      await updateOrder(order.id, updateData);
      
      // Update local state on success
      setOrder(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tax: editableOrder.tax,
          shipping: editableOrder.shipping,
          discount: editableOrder.overallDiscount,
          subtotal,
          totalAmount: total
        }
      });
      
      setIsEditingSummary(false);
      toast.success("Order summary updated successfully!");
    } catch (error) {
      console.error("Error updating order summary:", error);
      toast.error("Failed to update order summary. Please try again.");
    }
  };

  const handlePrint = () => { 
    window.print(); 
    toast.success("Print dialog opened"); 
  };

  const openStatusDialog = () => { 
    setStatusForm({ status: order.status, reason: '', purpose: '' }); 
    setStatusDialog(true); 
  };

  const openPaymentDialog = () => { 
    setPaymentForm({ paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod }); 
    setPaymentDialog(true); 
  };

  const openProductsDialog = () => { 
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
          statusChangeReason: statusForm.reason,
          statusRemarks: statusForm.purpose
        };
      } else if (type === "payment") {
        updateData = {
          payment: {
            status: paymentForm.paymentStatus,
            method: paymentForm.paymentMethod
          }
        };
      } else if (type === "products") {
        // Calculate new subtotal and total based on updated products
        const subtotal = order.products.reduce((sum, item) => sum + (item.price * item.quantity) - (item.discount || 0), 0);
        const total = subtotal - editableOrder.overallDiscount + editableOrder.tax + editableOrder.shipping;
        
        updateData = {
          products: order.products.map(product => ({
            product: product.name,
            price: product.price,
            quantity: product.quantity,
            discount: product.discount || 0
          })),
          tax: editableOrder.tax,
          shipping: editableOrder.shipping,
          discount: editableOrder.overallDiscount,
          totalAmount: total
        };
      }

        // Call the update API with the order ID
        const updatedOrder = await updateOrder(order.id, updateData);
      
      // Update local state with the response from backend
      if (updatedOrder) {
        const mappedOrder: Order = {
          id: updatedOrder._id,
          customerName: updatedOrder.customer?.name || '',
          customerPhone: updatedOrder.customer?.phone || '',
          customerEmail: updatedOrder.customer?.email || '',
          customerAddress: updatedOrder.customer?.shippingAddress || updatedOrder.customer?.billingAddress || '',
          billingAddress: updatedOrder.customer?.billingAddress || '',
          products: (updatedOrder.products || []).map((p, idx) => ({
            id: String(idx + 1),
            name: p.product,
            price: p.price,
            quantity: p.quantity,
            discount: p.discount || 0,
          })),
          subtotal: (updatedOrder.products || []).reduce((sum, p) => sum + p.price * p.quantity - (p.discount || 0), 0),
          tax: updatedOrder.tax || 0,
          shipping: updatedOrder.shipping || 0,
          discount: updatedOrder.discount || 0,
          totalAmount: updatedOrder.totalAmount || 0,
          salesman: typeof updatedOrder.salesman === 'object' && updatedOrder.salesman && 'name' in updatedOrder.salesman ? (updatedOrder.salesman.name as string) : undefined,
          status: (updatedOrder.status as Order["status"]) || 'pending',
          paymentStatus: (updatedOrder.payment?.status as Order["paymentStatus"]) || 'unpaid',
          paymentMethod: updatedOrder.payment?.method || '',
          orderDate: updatedOrder.createdAt || new Date().toISOString(),
          history: (updatedOrder.timeline || []).map((t, i) => ({
            id: `H${i+1}`,
            date: t.date || new Date().toISOString(),
            status: t.action || 'pending',
            updatedBy: t.updatedBy || 'System',
            reason: t.statusChangeReason || '',
            purpose: t.statusRemarks || '',
            description: t.description || '',
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

  // Removed updateItem and calculateItemTotal, not used with correct Order type

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background p-4 gap-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full space-y-1">
              <Button variant="ghost" onClick={() => window.history.back()} className="mb-2 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
                  <p className="text-muted-foreground">Order ID: {order.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrint} className="bg-card hover:bg-muted">
                    <Printer className="w-4 h-4 mr-2" />Print
                  </Button>
                  <Button onClick={openStatusDialog} className="bg-warning hover:bg-warning/90 text-white">
                    <Edit className="w-4 h-4 mr-2" />Update Status
                  </Button>
                </div>
              </div>
            </div>
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
                {order.customerName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">Customer</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />Phone Number
              </p>
              <p className="font-semibold text-foreground">{order.customerPhone}</p>
            </div>
            {order.customerEmail && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />Email Address
                </p>
                <p className="font-semibold text-foreground">{order.customerEmail}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />Shipping Address
              </p>
              <p className="font-semibold text-foreground">{order.customerAddress}</p>
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
              <StatusBadge status={order.paymentStatus} />
            </div>
            {order.paymentMethod && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold text-foreground">{order.paymentMethod}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="font-bold text-2xl text-primary">₹{order.totalAmount.toFixed(2)}</p>
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
            {order.products.map((product) => (
              <div key={product.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-foreground">{product.name}</p>
                  <p className="font-bold text-foreground">₹{((product.price * product.quantity) - (product.discount || 0)).toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Qty: {product.quantity}</span>
                  <span>Price: ₹{product.price.toFixed(2)}</span>
                  {product.discount && product.discount > 0 && (
                    <span className="col-span-2 text-danger">Discount: -₹{product.discount.toFixed(2)}</span>
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
                {order.products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-foreground">{product.quantity}</td>
                    <td className="px-4 py-3 text-foreground">₹{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-danger">
                      {product.discount && product.discount > 0 ? `-₹${product.discount.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      ₹{((product.price * product.quantity) - (product.discount || 0)).toFixed(2)}
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
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
                {/* <DollarSign className="w-5 h-5" /> */}
                <span className="text-lg font-semibold">Total Amount</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ₹{order.totalAmount.toFixed(2)}
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
        <Card className="p-6 mt-6">
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
                  {item.description && (
                    <p className="text-sm text-foreground">{item.description}</p>
                  )}
                  {(item.reason || item.purpose) && !item.description && (
                    <p className="text-sm text-foreground">Note: {item.reason || item.purpose}</p>
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
                onValueChange={(value) => setStatusForm({ ...statusForm, status: value })}
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
              <Label>Reason</Label>
              <Textarea 
                placeholder="Enter a reason for this status change" 
                value={statusForm.reason} 
                onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })} 
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
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentStatus: value })}
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
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
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
            <>
  {order.products.map((product, index) => (
    <Card key={product.id || index} className="p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Product Name</Label>
        <Input 
          value={product.name} 
          onChange={(e) => {
            const newProducts = [...order.products];
            newProducts[index] = { ...newProducts[index], name: e.target.value };
            setOrder({ ...order, products: newProducts });
          }} 
        />
      </div>
      <div className="space-y-2">
        <Label>Quantity</Label>
        <Input 
          type="number" 
          value={product.quantity} 
          onChange={(e) => {
            const newProducts = [...order.products];
            newProducts[index] = { ...newProducts[index], quantity: parseInt(e.target.value) || 0 };
            setOrder({ ...order, products: newProducts });
          }} 
        />
      </div>
      <div className="space-y-2">
        <Label>Unit Price (₹)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={product.price} 
          onChange={(e) => {
            const newProducts = [...order.products];
            newProducts[index] = { ...newProducts[index], price: parseFloat(e.target.value) || 0 };
            setOrder({ ...order, products: newProducts });
          }} 
        />
      </div>
      <div className="space-y-2">
        <Label>Discount (₹)</Label>
        <Input 
          type="number" 
          step="0.01" 
          value={product.discount || 0} 
          onChange={(e) => {
            const newProducts = [...order.products];
            newProducts[index] = { ...newProducts[index], discount: parseFloat(e.target.value) || 0 };
            setOrder({ ...order, products: newProducts });
          }} 
        />
      </div>
      <div className="col-span-full flex justify-between items-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">Product Total:</span>
        <span className="font-bold text-lg">₹{((product.price * product.quantity) - (product.discount || 0)).toFixed(2)}</span>
      </div>
    </div>
  </Card>
  ))}
</>
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
          </div>
      
    );
  };
  
  export default OrderDetails;