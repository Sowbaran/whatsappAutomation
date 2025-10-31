import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrderItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onSave?: (items: OrderItem[], shipping: number, tax: number, overallDiscount: number) => void;
}

export function EditOrderDialog({ open, onOpenChange, order, onSave }: EditOrderDialogProps) {
  const [items, setItems] = useState<OrderItem[]>(order.items.map((item: any) => ({
    ...item,
    sku: item.sku || `SKU${Math.floor(1000 + Math.random() * 9000)}`,
    discount: item.discount || 0,
  })));
  const [shipping, setShipping] = useState(order.shipping || 0);
  const [tax, setTax] = useState(order.tax || 0);
  const [overallDiscount, setOverallDiscount] = useState(order.overallDiscount || 0);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const addProduct = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      name: '',
      sku: `SKU${Math.floor(1000 + Math.random() * 9000)}`,
      price: 0,
      quantity: 1,
      discount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeProduct = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDiscountChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const item = items.find(i => i.id === id);
    if (item) {
      const maxDiscount = item.price * item.quantity;
      const discount = Math.min(Math.max(0, numValue), maxDiscount);
      updateItem(id, 'discount', discount);
    }
  };

  const calculateItemSubtotal = (item: OrderItem) => {
    return (item.price * item.quantity) - (item.discount || 0);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + shipping + tax - (overallDiscount || 0);
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const confirmSaveChanges = () => {
    if (onSave) {
      onSave(items, shipping, tax, overallDiscount);
    }
    toast({
      title: 'Order Updated',
      description: 'Order information has been updated successfully',
    });
    setShowSaveConfirm(false);
  };
  return (
    <>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-5xl w-full max-w-[98vw] max-h-[90vh] overflow-y-auto p-2 sm:p-6 md:max-w-[90vw] lg:max-w-[80vw]"
          aria-describedby="order-edit-description"
        >
          <DialogHeader className="bg-gradient-to-r from-primary to-primary-glow text-white p-6 -m-6 mb-4 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-xl" id="order-edit-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M16.5 9.4 7.55 4.24" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="M3.27 6.96 12 12.01l8.73-5.05" />
                <path d="M12 22.08V12" />
              </svg>
              Edit Order Items
            </DialogTitle>
            <DialogDescription id="order-edit-description" className="sr-only">
              Edit the products and quantities for this order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={addProduct}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">Product</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">SKU</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">Price</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">Quantity</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">Discount</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">Subtotal</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/5">
                      <td className="py-3 px-2">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="Product name"
                          className="min-w-[150px]"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="min-w-[100px]"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="pl-6 text-right"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          placeholder="1"
                          min="1"
                          className="text-right"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={item.discount || 0}
                            onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                            placeholder="0.00"
                            className="pl-6 text-right"
                            min="0"
                            step="0.01"
                            max={item.price * item.quantity}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium text-right">
                        ₹{calculateItemSubtotal(item).toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProduct(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Subtotal</Label>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Shipping</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={shipping}
                        onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                        className="pl-6 text-right"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Tax</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                        className="pl-6 text-right"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Overall Discount</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={overallDiscount}
                        onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                        className="pl-6 text-right"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <Label className="text-lg font-bold">Total</Label>
                <span className="text-lg font-bold text-primary">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Confirm Order Update</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to update this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSaveChanges}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}