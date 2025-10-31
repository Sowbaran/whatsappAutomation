export type BackendOrder = {
  timeline?: Array<{
    action: string;
    description?: string;
    date?: string;
    updatedBy?: string;
    statusChangeReason?: string;
    statusRemarks?: string;
  }>;
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
};

async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchAssignedOrders() {
  return http<BackendOrder[]>("/api/salesmen/assigned-orders");
}

export function fetchAllOrdersForSalesman() {
  return http<BackendOrder[]>("/api/salesmen/all-orders");
}

export function fetchOrderByIdOrOrderId(idOrOrderId: string) {
  // Use the correct endpoint for fetching order details
  return http<BackendOrder>(`/api/orders/${encodeURIComponent(idOrOrderId)}`);
}

export function pickupOrder(orderMongoId: string) {
  return http<BackendOrder>(`/api/salesmen/pickup/${encodeURIComponent(orderMongoId)}`, { method: 'PUT' });
}

export function dropOrder(orderMongoId: string) {
  return http<BackendOrder>(`/api/salesmen/drop/${encodeURIComponent(orderMongoId)}`, { method: 'PUT' });
}

export function fetchSalesmanProfile() {
  return http<{ name: string; email: string; phone: string; region: string; joinedDate: string }>("/api/salesmen/profile");
}

export function fetchSalesmanProfileById(id: string) {
  return http<{ name: string; email: string; phone: string; region: string; joinedDate: string }>(`/api/salesmen/${encodeURIComponent(id)}`);
}

export function updateOrder(orderId: string, updateData: any) {
  return http<BackendOrder>(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
}
