import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function CustomerDialog({ open, onOpenChange, customer, orders, onSave }) {
  const [editableCustomer, setEditableCustomer] = useState(customer);
  const [editMode, setEditMode] = useState(false);

  // Calculate payment details based on name/email/phone for robust matching
  const customerOrders = orders.filter(
    (order) =>
      order.customer.email === customer.email ||
      order.customer.name === customer.name ||
      order.customer.phone === customer.phone
  );
  const totalAmount = customerOrders.reduce((sum, order) => sum + order.total, 0);
  const paidAmount = customerOrders
    .filter((order) => order.payment.status.toLowerCase() === 'paid')
    .reduce((sum, order) => sum + order.total, 0);
  const dueAmount = totalAmount - paidAmount;

  const handleChange = (e) => {
    setEditableCustomer({ ...editableCustomer, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditMode(false);
    onSave(editableCustomer);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl bg-background border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Customer Details</DialogTitle>
          <DialogDescription className="mb-4 text-base text-muted-foreground">
            View and edit all details for this customer
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <Input
              name="name"
              value={editableCustomer.name}
              onChange={handleChange}
              disabled={!editMode}
              className="mb-2"
            />
            <label className="block mb-1 font-medium">Email</label>
            <Input
              name="email"
              value={editableCustomer.email}
              onChange={handleChange}
              disabled={!editMode}
              className="mb-2"
            />
            <label className="block mb-1 font-medium">Phone</label>
            <Input
              name="phone"
              value={editableCustomer.phone}
              onChange={handleChange}
              disabled={!editMode}
              className="mb-2"
            />
            <label className="block mb-1 font-medium">Joined Date</label>
            <Input
              name="joinedDate"
              value={editableCustomer.joinedDate}
              onChange={handleChange}
              disabled={!editMode}
              className="mb-2"
            />
          </div>
          <div className="bg-muted/40 rounded-xl p-4 flex flex-col gap-3 border border-border">
            <div>
              <span className="font-semibold">Total Orders:</span> {customerOrders.length}
            </div>
            <div>
              <span className="font-semibold">Total Amount:</span> ₹{totalAmount.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Paid Amount:</span> ₹{paidAmount.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Due Amount:</span> ₹{dueAmount.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Payment Methods:</span> {Array.from(
                new Set(customerOrders.map((o) => o.payment.method))
              ).join(', ') || '-'}
            </div>
          </div>
        </div>
        <DialogFooter>
          {!editMode ? (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          ) : (
            <Button onClick={handleSave}>
              Save
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
