export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  billingAddress?: string;
  products: Product[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  totalAmount: number;
  status: "pending" | "completed" | "processing" | "product-packaged" | "salesman-assigned" | "shipment" | "picked-up" | "cancelled";
  paymentStatus: "paid" | "unpaid";
  paymentMethod?: string;
  orderDate: string;
  salesman?: string;
  region?: string;
  history?: OrderHistoryItem[];
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  status: string;
  updatedBy: string;
  reason?: string;
  purpose?: string;
  description?: string;
}
