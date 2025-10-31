import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export type StatusType = 'pending' | 'processing' | 'completed' | 'cancelled' | 'active' | 'inactive' | 'picked-up' | 'assigned';

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  processing: { label: 'Processing', className: 'bg-secondary/10 text-secondary border-secondary/20' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
  cancelled: { label: 'Cancelled', className: 'bg-danger/10 text-danger border-danger/20' },
  active: { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Inactive', className: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
  'picked-up': { label: 'Picked Up', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  assigned: { label: 'Assigned', className: 'bg-purple-100 text-purple-800 border-purple-200' },
} as const;

export const StatusBadge = ({ status, size = 'md', className, ...props }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
