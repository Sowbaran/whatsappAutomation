import { useState } from "react";
import { User, Mail, Phone, Calendar, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const salesmanData = {
    name: "Michael Johnson",
    email: "michael.johnson@electroshop.com",
    phone: "+1 (555) 987-6543",
    region: "West Region",
    joinedDate: "March 22, 2023",
  };

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    // In a real app, you would clear auth tokens and redirect to login
    navigate("/");
    setLogoutDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{salesmanData.name}</h2>
              <p className="text-primary-foreground/90 font-medium">
                {salesmanData.region}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </h3>
                <p className="text-base font-semibold text-foreground break-all">
                  {salesmanData.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Phone
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {salesmanData.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Joined Date
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {salesmanData.joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-8 pt-0">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2 font-semibold py-6 text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              onClick={() => setLogoutDialog(true)}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={logoutDialog}
        onOpenChange={setLogoutDialog}
        title="Confirm Logout"
        description="Are you sure you want to logout from your account?"
        onConfirm={handleLogout}
        confirmText="Yes, Logout"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default Profile;
