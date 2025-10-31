import { useMemo, useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge, type StatusType } from '@/components/ui/status-badge';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type BackendProduct } from '@/lib/api';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const products = (data || []) as BackendProduct[];

  const filteredProducts = useMemo(() => {
    return products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Products Management</h1>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">All Products</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {product._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">-</td>
                    <td className="py-4 px-4 font-semibold">₹{product.price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${product.stock < 50 ? 'text-warning' : 'text-success'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={(product.stock > 0 ? 'active' : 'inactive') as StatusType} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
