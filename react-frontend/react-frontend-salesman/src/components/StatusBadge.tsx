import { cn } from "@/lib/utils";

type StatusType =
  | "pending"
  | "completed"
  | "processing"
  | "product-packaged"
  | "salesman-assigned"
  | "shipment"
  | "picked-up"
  | "paid"
  | "unpaid"
  | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  completed: {
    label: "Completed",
    className: "bg-success/20 text-success border-success/30",
  },
  processing: {
    label: "Processing",
    className: "bg-secondary/20 text-secondary border-secondary/30",
  },
  "product-packaged": {
    label: "Product Packaged",
    className: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  "salesman-assigned": {
    label: "Salesman Assigned",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  shipment: {
    label: "In Shipment",
    className: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
  },
  "picked-up": {
    label: "Picked Up",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  paid: {
    label: "Paid",
    className: "bg-success/20 text-success border-success/30",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-danger/20 text-danger border-danger/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  if (!config) {
    // Fallback for undefined or invalid status
    return (
      <span
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-muted/20 text-muted border-muted/30",
          className
        )}
      >
        Unknown
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
