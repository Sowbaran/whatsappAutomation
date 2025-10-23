import { LogOut, User } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LogoutAccountBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth tokens if any
    window.location.href = "http://localhost:3000/login";
    setOpen(false);
  };

  return (
    <div className="absolute top-4 right-6 z-50 flex items-center gap-3">
      {/* Account Icon */}
      <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}
        className="rounded-full border border-border shadow hover:bg-muted">
        <User className="w-6 h-6" />
      </Button>
      {/* Logout Button and Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="border-destructive text-destructive hover:bg-destructive/10" aria-label="Logout">
            <LogOut className="w-6 h-6" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-sm rounded-2xl bg-background border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-destructive">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="mb-2 text-base text-muted-foreground">
              Are you sure you want to logout from your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
