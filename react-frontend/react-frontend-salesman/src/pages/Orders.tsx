import { useMemo, useState } from "react";
import { Search, Eye, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllOrdersForSalesman, pickupOrder, dropOrder, type BackendOrder } from "@/lib/api";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["salesman","all-orders"], queryFn: fetchAllOrdersForSalesman });
  const orders = useMemo(() => {
    const list = (data || []) as BackendOrder[];
    // Show all orders (no filtering by salesman)
    return list.map((o) => {
      const status = (o.status?.toLowerCase() as Order["status"]) || "pending";
      const pickedUp = (o as any).pickedUp || false;
      const isPendingOrProcessing = status === 'pending' || status === 'processing';
      
      return {
        id: o._id, // for actions
        orderId: o.orderId, // for display
        customerName: o.customer?.name || "",
        customerPhone: o.customer?.phone || "",
        customerEmail: o.customer?.email || "",
        customerAddress: o.customer?.shippingAddress || o.customer?.billingAddress || "",
        products: (o.products || []).map((p, idx) => ({ id: String(idx+1), name: p.product, quantity: p.quantity, price: p.price })),
        totalAmount: o.totalAmount || 0,
        status: status,
        pickedUp: pickedUp,
        canPickup: isPendingOrProcessing && !pickedUp,
        canDrop: pickedUp, // Show drop button for any picked up order
        paymentStatus: ((o.payment?.status || "unpaid").toLowerCase() as Order["paymentStatus"]),
        orderDate: o.createdAt || new Date().toISOString(),
        salesman: typeof o.salesman === 'object' && o.salesman && 'name' in o.salesman ? (o.salesman as any).name : undefined,
      } as Order & { orderId: string, pickedUp?: boolean, canPickup?: boolean, canDrop?: boolean };
    });
  }, [data]);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { orderId: string, pickedUp?: boolean, canPickup?: boolean, canDrop?: boolean }) | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    action: "pickup" | "drop";
  }>({ open: false, orderId: "", action: "pickup" });
  const [detailsDialog, setDetailsDialog] = useState(false);
  const navigate = useNavigate();

  const filteredOrders = orders.filter(
    (order) =>
      (order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm))
  );

  const handlePickup = (orderId: string) => {
    setConfirmDialog({ open: true, orderId, action: "pickup" });
  };

  const handleDrop = (orderId: string) => {
    setConfirmDialog({ open: true, orderId, action: "drop" });
  };

  const pickupMut = useMutation({
    mutationFn: (id: string) => pickupOrder(id),
    onSuccess: (_, id) => {
      toast.success("Order picked up successfully!");
      
      // Optimistically update the order in cache to show drop button immediately
      queryClient.setQueryData(["salesman","all-orders"], (oldData: BackendOrder[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order._id === id 
            ? { ...order, pickedUp: true } 
            : order
        );
      });
      
      // Then refresh from server
      queryClient.invalidateQueries({ queryKey: ["salesman","assigned-orders"] });
      queryClient.invalidateQueries({ queryKey: ["salesman","all-orders"] });
      setConfirmDialog({ open: false, orderId: "", action: "pickup" });
    },
    onError: () => toast.error("Failed to pickup order"),
  });
  const dropMut = useMutation({
    mutationFn: (id: string) => dropOrder(id),
    onSuccess: (_, id) => {
      toast.success("Order dropped. Available for re-pickup.");
      
      // Optimistically update the order in cache to show pickup button immediately
      queryClient.setQueryData(["salesman","all-orders"], (oldData: BackendOrder[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order._id === id 
            ? { ...order, pickedUp: false } 
            : order
        );
      });
      
      // Then refresh from server
      queryClient.invalidateQueries({ queryKey: ["salesman","assigned-orders"] });
      queryClient.invalidateQueries({ queryKey: ["salesman","all-orders"] });
      setConfirmDialog({ open: false, orderId: "", action: "pickup" });
    },
    onError: () => toast.error("Failed to drop order"),
  });
  const confirmAction = () => {
    const { orderId, action } = confirmDialog;
    if (!orderId) return;
    if (action === "pickup") pickupMut.mutate(orderId);
    else dropMut.mutate(orderId);
  };

  const showDetails = (order: Order & { orderId: string, pickedUp?: boolean, canPickup?: boolean, canDrop?: boolean }) => {
    setSelectedOrder(order);
    setDetailsDialog(true);
  };

  const viewDetails = (orderMongoId: string) => {
    navigate(`/orders/${orderMongoId}`);
  };

  // Order update persistence logic (example: status update)
  const updateOrderMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      // Replace with actual API endpoint for updating order
      return fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update order');
        return res.json();
      });
    },
    onSuccess: () => {
      toast.success('Order updated successfully!');
      queryClient.invalidateQueries({ queryKey: ["salesman","all-orders"] });
    },
    onError: () => toast.error('Failed to update order'),
  });

  // Example usage: updateOrderMut.mutate({ id: order.id, updates: { status: "completed" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Order List</h2>
          <div className="relative w-full sm:w-72 flex gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Button
              variant="outline"
              onClick={() => {
                // Example filter: only show orders with status 'pending'
                setSearchTerm('');
                // You can add more advanced filter logic here
                toast.info('Filter applied: Pending orders');
              }}
            >
              Filter Pending
            </Button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading...</div>}
          {isError && <div className="p-4 text-sm text-red-600">Failed to load orders</div>}
          {!isLoading && !isError && filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{order.orderId}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">{order.customerPhone}</p>
                  <p className="font-semibold text-foreground">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showDetails(order)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {order.canPickup && (
                    <Button
                      size="sm"
                      onClick={() => handlePickup(order.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Pickup
                    </Button>
                  )}
                  {order.canDrop && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDrop(order.id)}
                      className="flex-1"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Drop
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {order.customerPhone}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDetails(order.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {order.canPickup && (
                        <Button
                          size="sm"
                          onClick={() => handlePickup(order.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Pickup
                        </Button>
                      )}
                      {order.canDrop && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDrop(order.id)}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Drop
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick View Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="bg-card text-card-foreground rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">
                    ₹{selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-semibold">{selectedOrder.customerAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Products</p>
                <ul className="space-y-2">
                  {selectedOrder.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-lg"
                    >
                      <span className="font-medium text-card-foreground">
                        {product.name} x {product.quantity}
                      </span>
                      <span className="font-semibold text-card-foreground">
                        ₹{(product.price * product.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => viewDetails(selectedOrder.id)}
                className="w-full bg-primary hover:bg-primary-dark"
              >
                View Full Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
        title={
          confirmDialog.action === "pickup"
            ? "Confirm Pickup"
            : "Confirm Drop"
        }
        description={
          confirmDialog.action === "pickup"
            ? "Are you sure you want to pick up this order?"
            : "Are you sure you want to drop this order? It will be available for re-pickup."
        }
        onConfirm={confirmAction}
        confirmText={confirmDialog.action === "pickup" ? "Yes, Pickup" : "Yes, Drop"}
        variant={confirmDialog.action === "drop" ? "destructive" : "default"}
      />
    </div>
  );
};

export default Orders;
