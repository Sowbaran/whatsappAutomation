import { useState } from "react";
import { Search, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { mockOrders } from "@/data/mockOrders";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusFilter = Order["status"] | "all";

const AssignedOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [orders] = useState<Order[]>(
    mockOrders.filter((order) => order.salesman === "Michael Johnson")
  );
  const navigate = useNavigate();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "salesman-assigned", label: "Assigned" },
    { value: "picked-up", label: "Picked Up" },
    { value: "shipment", label: "In Shipment" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground">Assigned Orders</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              Your Assigned Orders
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {statusOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={statusFilter === option.value}
                      onCheckedChange={() => setStatusFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">{order.customerPhone}</p>
                  <p className="font-semibold text-foreground">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">{order.customerName}</td>
                  <td className="px-6 py-4">{order.customerPhone}</td>
                  <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AssignedOrders;