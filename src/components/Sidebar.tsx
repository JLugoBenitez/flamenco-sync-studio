import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  AlertCircle, 
  ShoppingCart,
  DollarSign,
  Clock,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Package, label: "Productos", path: "/productos" },
    { icon: ShoppingCart, label: "Encargos", path: "/encargos" },
    { icon: Users, label: "Empleados", path: "/empleados" },
    { icon: Clock, label: "Fichajes", path: "/fichajes" },
    { icon: AlertCircle, label: "Incidencias", path: "/incidencias" },
    { icon: DollarSign, label: "Facturación", path: "/facturacion" },
    { icon: Settings, label: "Configuración", path: "/configuracion" }
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative w-6 h-6">
          <div className={cn(
            "absolute inset-0 transition-all duration-300",
            isOpen ? "rotate-45" : "rotate-0"
          )}>
            <Menu className={cn(
              "w-6 h-6 transition-all duration-300",
              isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
            )} />
            <X className={cn(
              "absolute inset-0 w-6 h-6 transition-all duration-300",
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
            )} />
          </div>
        </div>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-72 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">
                FlamencoPuro
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Gestión Integral
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 px-4 transition-all duration-200 group relative",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-3 w-full",
                    isActive && "transform scale-105"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all",
                      isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                    )} />
                    <span className="font-medium truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-sidebar-primary-foreground rounded-full animate-pulse" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50">
          <div className="mb-4 p-3 rounded-lg bg-sidebar-accent/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  Administrador
                </p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-11 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span className="font-medium">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
