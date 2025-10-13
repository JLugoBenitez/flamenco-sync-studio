import { Link, useLocation } from "react-router-dom";
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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const location = useLocation();

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
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          FlamencoPuro
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
          Gestión Integral
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 transition-all",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground">
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
