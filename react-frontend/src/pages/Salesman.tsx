import { useEffect, useState } from 'react';
import { fetchSalesmen, createSalesman, updateSalesman, fetchSalesmanById, BackendSalesman } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Salesman {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Removed initialSalesmen, now fetched from backend

const SalesmanPage = () => {
  const [salesmen, setSalesmen] = useState<BackendSalesman[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);

  // Loading/error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editing, setEditing] = useState(false);
  const [editSalesman, setEditSalesman] = useState<Salesman | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const handleEditSalesman = async (salesman: BackendSalesman) => {
    setEditSalesman(salesman as any);
    setEditName(salesman.name);
    setEditEmail(salesman.email || '');
    try {
      const fullSalesman = await fetchSalesmanById((salesman as any)._id);
      setEditPassword(fullSalesman.password || '');
    } catch {
      setEditPassword('');
    }
    setEditPhone((salesman as any).phone || '');
    setEditing(true);
  };


  const handleSaveEdit = async () => {
    if (!editSalesman) return;
    setSavingEdit(true);
    setError(null);
    try {
      await updateSalesman((editSalesman as any)._id, {
        name: editName,
        email: editEmail,
        password: editPassword,
        phone: editPhone,
      });
      toast.success('Salesman updated');
      await loadSalesmen();
      setEditing(false);
      setEditSalesman(null);
    } catch (e: any) {
      setError(e.message || 'Failed to update salesman');
      toast.error('Failed to update salesman');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditSalesman(null);
  };

  const handleAdd = async () => {
    setAdding(true);
    setError(null);
    try {
      await createSalesman({ name, email, password, phone });
      toast.success('Salesman added');
      await loadSalesmen();
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setShowAdd(false);
    } catch (e: any) {
      setError(e.message || 'Failed to add salesman');
      toast.error('Failed to add salesman');
    } finally {
      setAdding(false);
    }
  };

  // Load salesmen from backend
  const loadSalesmen = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSalesmen();
      setSalesmen(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load salesmen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesmen();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">Salesman List</h1>
        <Button onClick={() => setShowAdd(true)} variant="default">Add Salesman</Button>
      </div>
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>All Salesmen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Phone</th>
                  <th className="text-right py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4}>Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="text-red-500">{error}</td></tr>
                ) : salesmen.map((s) => (
                  <tr key={s._id} className="border-b border-border/30">
                    <td className="py-2 px-4">{s.name}</td>
                    <td className="py-2 px-4">{s.email}</td>
                    <td className="py-2 px-4">{(s as any).phone}</td>
                    <td className="py-2 px-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleEditSalesman(s)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade-in">
          <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-md border border-border/60">
            <h2 className="text-2xl font-bold mb-2 text-primary">Edit Salesman</h2>
            <div className="space-y-3 mb-4">
              <input
                className="w-full rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                placeholder="Name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                placeholder="Email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                type="email"
              />
              <input
                className="w-full rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                placeholder="Password"
                value={editPassword}
                onChange={e => setEditPassword(e.target.value)}
                type="password"
              />
              <input
                className="w-full rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                placeholder="Phone Number"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={handleCancelEdit} variant="outline">Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit || !editName || !editEmail || !editPassword || !editPhone} variant="default">
                {savingEdit ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Add Salesman</h2>
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="mb-2" />
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-2" />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mb-2" />
            <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="mb-4" />
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setShowAdd(false)} variant="outline">Cancel</Button>
              <Button onClick={handleAdd} disabled={adding || !name || !email || !password || !phone} variant="default">
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmanPage;
