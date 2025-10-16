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
  X,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Sidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
        className="fixed top-3 left-3 z-30 lg:hidden w-10 h-10 rounded-lg bg-background/95 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-primary hover:text-white mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative w-5 h-5">
          <div className={cn(
            "absolute inset-0 transition-all duration-300",
            isOpen ? "rotate-45" : "rotate-0"
          )}>
            <Menu className={cn(
              "w-5 h-5 transition-all duration-300",
              isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
            )} />
            <X className={cn(
              "absolute inset-0 w-5 h-5 transition-all duration-300",
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
            )} />
          </div>
        </div>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 min-h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col transition-all duration-300 shadow-xl sidebar",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 sm:p-6 border-b border-border/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">F</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-primary-gradient truncate">
                FlamencoPuro
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Gestión Integral
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 sm:gap-3 h-10 sm:h-12 px-2 sm:px-4 transition-all duration-200 group relative",
                    isActive 
                      ? "highlight-primary text-white shadow-lg" 
                      : "text-foreground/80 hover:bg-primary/10 hover:text-primary hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2 sm:gap-3 w-full min-w-0",
                    isActive && "transform scale-105"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-all",
                      isActive ? "text-white" : "text-foreground/70 group-hover:text-primary"
                    )} />
                    <span className="font-medium truncate text-sm sm:text-base">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-1 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 sm:p-4 border-t border-border/50">
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrador
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-2 sm:mb-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-11 text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all duration-200 group px-2 sm:px-3"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-12" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-12" />
              )}
              <span className="font-medium text-xs sm:text-sm truncate">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-11 text-foreground/80 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group px-2 sm:px-3"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-12" />
            <span className="font-medium text-xs sm:text-sm truncate">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
