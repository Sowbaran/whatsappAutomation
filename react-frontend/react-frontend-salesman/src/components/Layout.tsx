import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, ShoppingCart, ClipboardList, User, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    // Clear auth token
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // Redirect to the login page in the react-frontend folder
    window.location.href = 'http://localhost:3000/login';
  };

  const navItems = [
    { path: "/", label: "Orders", icon: ShoppingCart },
    { path: "/assigned-orders", label: "Assigned Orders", icon: ClipboardList },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;


  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">ElectroShop</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-sidebar-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-sidebar-foreground" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-sidebar-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-sidebar-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2 text-sidebar-foreground">
              <Zap className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">ElectroShop</h2>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-sidebar-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-sidebar-foreground" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 mt-16 lg:mt-0 flex flex-col h-[calc(100%-theme(spacing.16))]">
            <ul className="space-y-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "border-l-4 hover:bg-sidebar-accent",
                        isActive(item.path)
                          ? "border-l-primary bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "border-l-transparent text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-sidebar-border">
              <button
                onClick={() => setShowLogoutDialog(true)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "border-l-4 hover:bg-sidebar-accent text-destructive/90 hover:text-destructive",
                  "border-l-transparent"
                )}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutDialog(false)}
              className="text-foreground"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
