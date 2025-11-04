import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, X, ChevronLeft, LayoutDashboard, ShoppingCart, Users, Package, TrendingUp, Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Sales Progress', href: '/sales', icon: TrendingUp },
  { name: 'Salesman', href: '/salesman', icon: Users },
];

import { useNavigate } from 'react-router-dom';

export const DashboardLayout = () => {
  const location = useLocation();
  // Sidebar is open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  // Admin account dialog state
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [adminPassword, setAdminPassword] = useState('password123');
  const [pendingEmail, setPendingEmail] = useState(adminEmail);
  const [pendingPassword, setPendingPassword] = useState(adminPassword);
  const [saving, setSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Listen for resize to auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on navigation (laptop/mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location]);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session/localStorage (adjust key as needed)
    localStorage.removeItem('admin');
    sessionStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      {/* Sidebar: hidden on mobile unless open */}
      <aside
        className={`fixed z-40 top-0 bottom-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar border-r border-sidebar-border flex flex-col`}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-sidebar-primary" />
            </div>
          )}
          {/* Minimize/maximize sidebar button: always visible on laptop (lg:) */}
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden lg:inline-flex"
            aria-label={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {/* Close sidebar button: only show on mobile */}
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary border-l-4 border-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        {/* Sidebar Logout Button - Sticky at bottom */}
        <div className="sticky bottom-0 p-4 bg-sidebar border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-accent justify-start"
            onClick={() => setShowLogoutDialog(true)}
          >
            <span><LogOut className="h-5 w-5" /></span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </Button>
        </div>
        {/* Logout Confirmation Dialog */}
        {showLogoutDialog && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md md:max-w-lg border border-border/60 mx-auto">
              <div className="flex flex-col items-center gap-2 mb-6">
                <LogOut className="h-12 w-12 text-red-500 mb-2" />
                <h3 className="text-2xl font-bold mb-1 text-red-600 dark:text-red-400">Confirm Logout</h3>
                <p className="text-muted-foreground text-sm text-center">Are you sure you want to log out? You will be redirected to the login page.</p>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          {/* Admin account icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAccountDialog(true)}
            className="rounded-full ml-2"
            title="Admin Account"
          >
            <User className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        {/* Admin Account Dialog */}
        {showAccountDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-card rounded-xl shadow-2xl p-8 w-full max-w-md border border-border/60 relative">
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowAccountDialog(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center gap-2 mb-6">
                <User className="h-12 w-12 text-primary mb-2" />
                <h2 className="text-2xl font-bold mb-1">Admin Account</h2>
                <p className="text-muted-foreground text-sm">Edit your admin details below.</p>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setShowConfirmDialog(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    type="email"
                    value={pendingEmail}
                    onChange={e => setPendingEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    type="password"
                    value={pendingPassword}
                    onChange={e => setPendingPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAccountDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" disabled={saving || (!pendingEmail || !pendingPassword || (pendingEmail === adminEmail && pendingPassword === adminPassword))}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-card rounded-xl shadow-2xl p-8 w-full max-w-sm border border-border/60">
              <h3 className="text-xl font-semibold mb-2 text-primary">Confirm Update</h3>
              <p className="mb-4 text-muted-foreground">Are you sure you want to update your admin details?</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setSaving(true);
                    setTimeout(() => {
                      setAdminEmail(pendingEmail);
                      setAdminPassword(pendingPassword);
                      setShowConfirmDialog(false);
                      setShowAccountDialog(false);
                      setSaving(false);
                    }, 700);
                  }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
