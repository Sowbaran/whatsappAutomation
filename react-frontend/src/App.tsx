import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/orders", element: <Orders /> },
      { path: "/orders/:id", element: <OrderDetails /> },
      { path: "/customers", element: <Customers /> },
      { path: "/products", element: <Products /> },
      { path: "/sales", element: <SalesProgress /> },
      { path: "/salesman", element: <SalesmanPage /> },
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
