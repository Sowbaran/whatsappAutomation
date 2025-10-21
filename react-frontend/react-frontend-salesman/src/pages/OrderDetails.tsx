import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, DollarSign, Package, User, Edit, Printer, CreditCard, Clock, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Order, Product } from "@/types/order";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderByIdOrOrderId, type BackendOrder } from "@/lib/api";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [productsDialog, setProductsDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "status" | "payment" | "products" }>({ open: false, type: "status" });
  const [statusForm, setStatusForm] = useState({ status: order?.status || "", reason: "", purpose: "" });
  const [paymentForm, setPaymentForm] = useState({ paymentStatus: order?.paymentStatus || "", paymentMethod: order?.paymentMethod || "" });
  const [productsForm, setProductsForm] = useState<Product[]>(order?.products || []);
  
  // State for editable order summary
  const [editableOrder, setEditableOrder] = useState({
    tax: order?.tax || 0,
    shipping: order?.shipping || 0,
    overallDiscount: order?.discount || 0
  });
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // Fetch order from backend and map to local Order type
  const { data } = useQuery({
    queryKey: ["salesman","order", orderId],
    queryFn: async () => (orderId ? fetchOrderByIdOrOrderId(orderId) : undefined),
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!data) return;
    const o = data as BackendOrder;
    const mapped: Order = {
      id: o._id, // use Mongo _id in salesman app
      customerName: o.customer?.name || "",
      customerPhone: o.customer?.phone || "",
      customerEmail: o.customer?.email || "",
      customerAddress: o.customer?.shippingAddress || o.customer?.billingAddress || "",
      products: (o.products || []).map((p, idx) => ({ id: String(idx+1), name: p.product, quantity: p.quantity, price: p.price })),
      subtotal: (o.products || []).reduce((sum, p) => sum + p.price * p.quantity, 0),
      discount: 0,
      tax: 0,
      shipping: 0,
      totalAmount: o.totalAmount || 0,
      status: (o.status?.toLowerCase() as Order["status"]) || "pending",
      paymentStatus: ((o.payment?.status || "unpaid").toLowerCase() as Order["paymentStatus"]),
      paymentMethod: o.payment?.method || undefined,
      orderDate: o.createdAt || new Date().toISOString(),
      salesman: typeof o.salesman === 'object' && o.salesman && 'name' in o.salesman ? (o.salesman as any).name : undefined,
      history: [],
    };
    setOrder(mapped);
  }, [data]);

  // Update editable order when order changes
  useEffect(() => {
    if (order) {
      setEditableOrder({
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        overallDiscount: order.discount || 0
      });
    }
  }, [order]);

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
  const handleSaveOrderSummary = () => {
    const subtotal = productsForm.reduce((sum, p) => sum + (p.price * p.quantity) - (p.discount || 0), 0);
    const total = subtotal - editableOrder.overallDiscount + editableOrder.tax + editableOrder.shipping;
    
    setOrder(prev => ({
      ...prev,
      tax: editableOrder.tax,
      shipping: editableOrder.shipping,
      discount: editableOrder.overallDiscount,
      subtotal,
      totalAmount: total
    }));
    
    setIsEditingSummary(false);
    toast.success("Order summary updated successfully!");
  };

  const handlePrint = () => { 
    window.print(); 
    toast.success("Print dialog opened"); 
  };

  const openStatusDialog = () => { 
    setStatusForm({ status: order.status, reason: "", purpose: "" }); 
    setStatusDialog(true); 
  };

  const openPaymentDialog = () => { 
    setPaymentForm({ paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod || "" }); 
    setPaymentDialog(true); 
  };

  const openProductsDialog = () => { 
    setProductsForm([...order.products]); 
    setProductsDialog(true); 
  };

  const handleStatusSubmit = () => { 
    setStatusDialog(false); 
    setConfirmDialog({ open: true, type: "status" }); 
  };

  const handlePaymentSubmit = () => { 
    setPaymentDialog(false); 
    setConfirmDialog({ open: true, type: "payment" }); 
  };

  const handleProductsSubmit = () => { 
    // Recalculate subtotal based on products
    const subtotal = productsForm.reduce((sum, p) => sum + (p.price * p.quantity) - (p.discount || 0), 0);
    const total = subtotal - editableOrder.overallDiscount + editableOrder.tax + editableOrder.shipping;
    
    setOrder(prev => ({
      ...prev,
      products: productsForm,
      subtotal,
      totalAmount: total
    }));
    
    setProductsDialog(false);
    setConfirmDialog({ open: false, type: "products" });
    toast.success("Products updated successfully!");
  };

  const confirmUpdate = () => {
    const type = confirmDialog.type;
    if (type === "status") {
      const newHistory = [...(order.history || []), { 
        id: `H${(order.history?.length || 0) + 1}`, 
        date: new Date().toISOString(), 
        status: statusForm.status, 
        updatedBy: "Salesman", 
        reason: statusForm.reason, 
        purpose: statusForm.purpose 
      }];
      setOrder({ ...order, status: statusForm.status as Order["status"], history: newHistory });
      toast.success("Order status updated successfully!");
    } else if (type === "payment") {
      setOrder({ ...order, 
        paymentStatus: paymentForm.paymentStatus as Order["paymentStatus"], 
        paymentMethod: paymentForm.paymentMethod 
      });
      toast.success("Payment information updated successfully!");
    }
    
    setConfirmDialog({ open: false, type: "status" });
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const updated = [...productsForm];
    updated[index] = { ...updated[index], [field]: value };
    setProductsForm(updated);
  };

  const calculateProductTotal = (product: Product) => (product.price * product.quantity) - (product.discount || 0);

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
            {order.billingAddress && order.billingAddress !== order.customerAddress && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />Billing Address
                </p>
                <p className="font-semibold text-foreground">{order.billingAddress}</p>
              </div>
            )}
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
              <p className="font-bold text-2xl text-primary">${order.totalAmount.toFixed(2)}</p>
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
                  <p className="font-bold text-foreground">${calculateProductTotal(product).toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Qty: {product.quantity}</span>
                  <span>Price: ${product.price.toFixed(2)}</span>
                  {product.discount && product.discount > 0 && (
                    <span className="col-span-2 text-danger">Discount: -${product.discount.toFixed(2)}</span>
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
                    <td className="px-4 py-3 text-foreground">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-danger">
                      {product.discount && product.discount > 0 ? `-$${product.discount.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      ${calculateProductTotal(product).toFixed(2)}
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
              <span className="font-semibold">${(order.subtotal || 0).toFixed(2)}</span>
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
                <span className="text-danger font-semibold">-${(order.discount || 0).toFixed(2)}</span>
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
                <span className="font-semibold">${(order.tax || 0).toFixed(2)}</span>
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
                <span className="font-semibold">${(order.shipping || 0).toFixed(2)}</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-foreground">
                <DollarSign className="w-5 h-5" />
                <span className="text-lg font-semibold">Total Amount</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ${order.totalAmount.toFixed(2)}
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
            {order.history.map((item) => (
              <div key={item.id} className="relative">
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
                  {item.reason && (
                    <p className="text-sm text-foreground">Reason: {item.reason}</p>
                  )}
                  {item.purpose && (
                    <p className="text-sm text-foreground">Purpose: {item.purpose}</p>
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
                  <SelectItem value="product-packaged">Product Packaged</SelectItem>
                  <SelectItem value="salesman-assigned">Salesman Assigned</SelectItem>
                  <SelectItem value="picked-up">Picked Up</SelectItem>
                  <SelectItem value="shipment">Shipment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input 
                placeholder="Enter reason for status change" 
                value={statusForm.reason} 
                onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea 
                placeholder="Enter purpose for this update" 
                value={statusForm.purpose} 
                onChange={(e) => setStatusForm({ ...statusForm, purpose: e.target.value })} 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button 
              onClick={handleStatusSubmit}
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
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
                  <SelectItem value="unpaid">Unpaid</SelectItem>
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
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
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
            {productsForm.map((product, index) => (
              <Card key={product.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input 
                      value={product.name} 
                      onChange={(e) => updateProduct(index, "name", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      value={product.quantity} 
                      onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={product.price} 
                      onChange={(e) => updateProduct(index, "price", parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={product.discount || 0} 
                      onChange={(e) => updateProduct(index, "discount", parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="col-span-full flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Product Total:</span>
                    <span className="font-bold text-lg">${calculateProductTotal(product).toFixed(2)}</span>
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
          if (!open) {
            if (confirmDialog.type === 'status') {
              setStatusDialog(true);
            }
          }
          setConfirmDialog({ ...confirmDialog, open });
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