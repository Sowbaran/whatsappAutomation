export type BackendSalesmanProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  region?: string;
  joinedDate?: string;
};

export async function fetchSalesmanProfile(): Promise<BackendSalesmanProfile> {
  const res = await fetch('/api/salesmen/profile', {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}
