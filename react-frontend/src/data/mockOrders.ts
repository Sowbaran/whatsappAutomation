import { Order, OrderStatus, PaymentStatus, PaymentMethod } from "@/types/order";

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    orderNumber: "ORD-2023-001",
    customer: {
      id: "CUST-001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, Anytown, USA"
    },
    date: "2023-06-15T10:30:00Z",
    status: "processing" as OrderStatus,
    items: [
      {
        id: "ITEM-001",
        name: "Wireless Headphones",
        sku: "WH-1000XM4",
        quantity: 1,
        price: 349.99,
        discount: 0
      },
      {
        id: "ITEM-002",
        name: "Smartphone Case",
        sku: "SC-IP13-BLK",
        quantity: 1,
        price: 29.99,
        discount: 5.00
      }
    ],
    subtotal: 379.98,
    tax: 30.40,
    shipping: 9.99,
    total: 420.37,
    payment: {
      method: "credit_card" as PaymentMethod,
      status: "paid" as PaymentStatus,
      transactionId: "TXN-987654321",
      amount: 420.37,
      date: "2023-06-15T10:35:00Z"
    },
    notes: "Please deliver after 5 PM",
    history: [
      {
        date: "2023-06-15T10:35:00Z",
        status: "Payment Received",
        note: "Payment processed successfully"
      },
      {
        date: "2023-06-15T10:30:00Z",
        status: "Order Placed",
        note: "Order was placed by customer"
      }
    ]
  },
  {
    id: "ORD-002",
    orderNumber: "ORD-2023-002",
    customer: {
      id: "CUST-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Ave, Sometown, USA"
    },
    date: "2023-07-20T14:45:00Z",
    status: "shipped" as OrderStatus,
    items: [
      {
        id: "ITEM-003",
        name: "Bluetooth Speaker",
        sku: "BS-2023",
        quantity: 2,
        price: 59.99,
        discount: 10.00
      },
      {
        id: "ITEM-004",
        name: "USB-C Cable",
        sku: "USBC-1M",
        quantity: 3,
        price: 12.99,
        discount: 0
      }
    ],
    subtotal: 158.95,
    tax: 12.72,
    shipping: 5.99,
    total: 177.66,
    payment: {
      method: "paypal" as PaymentMethod,
      status: "pending" as PaymentStatus,
      transactionId: "TXN-123456789",
      amount: 177.66,
      date: "2023-07-20T14:50:00Z"
    },
    notes: "Gift wrap the speaker",
    history: [
      {
        date: "2023-07-20T14:50:00Z",
        status: "Order Shipped",
        note: "Order shipped via UPS"
      },
      {
        date: "2023-07-20T14:45:00Z",
        status: "Order Placed",
        note: "Order was placed by customer"
      }
    ]
  },
  // Add more mock orders as needed
];
