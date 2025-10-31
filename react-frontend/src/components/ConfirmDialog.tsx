import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-primary-foreground">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="bg-card text-card-foreground rounded-xl p-6 my-2">
          <AlertDialogDescription className="text-base text-card-foreground font-medium">
            {description}
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter className="flex gap-3 sm:gap-3">
          <AlertDialogCancel className="border-border text-foreground font-semibold">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-danger hover:bg-danger/90 text-white font-semibold"
                : "bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-elegant font-semibold"
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
