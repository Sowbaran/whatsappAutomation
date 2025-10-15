import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  icon: Icon,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: "default" | "destructive"
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {Icon && (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-medium leading-none tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onCancel?.()
              }}
              className="border-border/50 hover:bg-accent/50"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
              className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-elegant"
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
