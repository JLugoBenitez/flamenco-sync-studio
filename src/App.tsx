import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/productos" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/encargos" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/empleados" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/fichajes" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/incidencias" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/facturacion" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/configuracion" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
