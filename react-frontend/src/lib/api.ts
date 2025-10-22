// Stub for build error resolution only
export async function unassignOrderFromSalesman(orderId: string) {
  // No-op or implement as needed
  return http<BackendOrder>(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    body: JSON.stringify({ salesman: null }),
  });
}
async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const url = typeof input === 'string' && input.startsWith('/') 
    ? `http://localhost:5000${input}` 
    : input;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type BackendOrder = {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    shippingAddress?: string;
    billingAddress?: string;
  };
  products: Array<{
    product: string;
    sku?: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  salesman?: { _id: string; name?: string } | string | null;
  payment?: { method?: string; status?: string };
  createdAt?: string;
  timeline?: Array<{ action: string; description?: string; date?: string; updatedBy?: string }>;
};

export async function fetchOrders() {
  return http<BackendOrder[]>("/api/orders");
}

export async function fetchOrderByOrderId(orderId: string) {
  return http<BackendOrder>(`/api/orders/id/${encodeURIComponent(orderId)}`);
}

export type BackendCustomer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
};

export async function fetchCustomers() {
  return http<BackendCustomer[]>("/api/customers");
}

export type BackendProduct = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt?: string;
};

export async function fetchProducts() {
  return http<BackendProduct[]>("/api/products");
}

export type BackendSalesman = {
  _id: string;
  name: string;
  email?: string;
  activeOrders?: number;
  totalSales?: number;
};

export async function fetchSalesmen() {
  return http<BackendSalesman[]>("/api/salesmen");
}

export async function fetchSalesmanById(id: string) {
  return http<BackendSalesman & { password?: string }>(`/api/salesmen/${encodeURIComponent(id)}`);
}

export async function createSalesman(input: { name: string; email: string; phone: string; password: string; region?: string }) {
  return http<BackendSalesman>("/api/salesmen", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSalesman(id: string, input: Partial<{ name: string; email: string; phone: string; password: string; region?: string }>) {
  return http<BackendSalesman>(`/api/salesmen/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateOrder(id: string, input: any) {
  return http<BackendOrder>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function assignOrderToSalesman(orderId: string, salesmanId: string) {
  return http<BackendOrder>(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    body: JSON.stringify({ salesman: salesmanId }),
  });
}
