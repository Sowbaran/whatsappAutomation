import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import SalesProgress from "./pages/SalesProgress";
import SalesmanPage from "./pages/Salesman";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simple admin auth check using localStorage/sessionStorage or a better context in production
const isAdmin = () => {
  // Replace this with your actual admin auth logic (e.g., JWT, context, etc.)
  return localStorage.getItem('role') === 'admin' || sessionStorage.getItem('role') === 'admin';
};

const RequireAdmin = () => (isAdmin() ? <Outlet /> : <Navigate to="/login" replace />);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/orders", element: <Orders /> },
          { path: "/orders/:id", element: <OrderDetails /> },
          { path: "/customers", element: <Customers /> },
          { path: "/products", element: <Products /> },
          { path: "/sales", element: <SalesProgress /> },
          { path: "/salesman", element: <SalesmanPage /> },
        ]
      }
    ]
  },
  { path: "*", element: <NotFound /> }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
