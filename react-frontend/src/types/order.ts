// src/types/order.ts
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'shipped' | 'delivered' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_paid';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount?: number;
  total?: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  amount: number;
  date: string;
}

export interface OrderHistoryItem {
  id?: string;
  date: string;
  status: string;
  note: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment: PaymentInfo;
  notes?: string;
  history: OrderHistoryItem[];
  salesman?: string;
  region?: string;
  discount?: number;
}

// For the order details page
export interface OrderDetailsProps {
  order: Order;
  onStatusChange?: (status: OrderStatus) => void;
  onPaymentUpdate?: (payment: Partial<PaymentInfo>) => void;
  onNotesSave?: (notes: string) => void;
}