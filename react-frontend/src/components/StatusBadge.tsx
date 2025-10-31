import { cn } from "@/lib/utils"
import { Badge, BadgeProps } from "@/components/ui/badge"

interface StatusBadgeProps extends BadgeProps {
  status: string
}

export default function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    completed: "default",
    paid: "default",
    processing: "secondary",
    pending: "outline",
    cancelled: "destructive",
    failed: "destructive",
    shipped: "default",
    delivered: "default",
    refunded: "outline",
    'partially_paid': 'outline',
    'cash_on_delivery': 'outline'
  }

  const displayText = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <Badge
      variant={variantMap[status] || "outline"}
      className={cn("whitespace-nowrap", className)}
      {...props}
    >
      {displayText}
    </Badge>
  )
}
