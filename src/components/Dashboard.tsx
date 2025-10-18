import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Users, FileText, AlertCircle, ShoppingCart, Plus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    productos: 0,
    encargos: 0,
    incidenciasAbiertas: 0,
    facturasPendientes: 0,
    totalFacturasPendientes: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    const [productosRes, encargosRes, incidenciasRes, facturasRes] = await Promise.all([
      supabase.from("productos").select("*", { count: "exact", head: true }),
      supabase.from("encargos").select("*", { count: "exact", head: true }).neq("estado", "entregado"),
      supabase.from("incidencias").select("*", { count: "exact", head: true }).eq("estado", "abierta"),
      supabase.from("facturas").select("total").eq("estado", "pendiente"),
    ]);

    setStats({
      productos: productosRes.count || 0,
      encargos: encargosRes.count || 0,
      incidenciasAbiertas: incidenciasRes.count || 0,
      facturasPendientes: facturasRes.data?.length || 0,
      totalFacturasPendientes: facturasRes.data?.reduce((sum, f) => sum + parseFloat(f.total.toString()), 0) || 0,
    });
  };

  const statsCards = [
    {
      title: "Productos en Stock",
      value: stats.productos.toString(),
      change: "Unidades totales",
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Encargos Activos",
      value: stats.encargos.toString(),
      change: "En proceso",
      icon: ShoppingCart,
      color: "text-secondary"
    },
    {
      title: "Incidencias Abiertas",
      value: stats.incidenciasAbiertas.toString(),
      change: "Requieren atención",
      icon: AlertCircle,
      color: "text-destructive"
    },
    {
      title: "Facturas Pendientes",
      value: stats.facturasPendientes.toString(),
      change: `${stats.totalFacturasPendientes.toFixed(2)}€`,
      icon: FileText,
      color: "text-accent"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative">
          <h1 className="heading-responsive font-bold tracking-tight text-primary-gradient">
            Panel de Control
          </h1>
          <p className="text-responsive text-muted-foreground mt-2 max-w-2xl">
            Gestión integral de FlamencoPuro. Monitorea el estado de tu negocio y accede rápidamente a las funciones principales.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="group card-highlight hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-3 sm:p-4">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
                <CardTitle className="text-xs sm:text-sm font-medium text-foreground/80 relative z-10 truncate">
                  {stat.title}
                </CardTitle>
                <div className="relative z-10">
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
              </CardHeader>
              <CardContent className="relative p-3 sm:p-4 pt-0">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button 
                onClick={() => navigate('/productos')}
                className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 btn-gradient-primary hover:scale-105 transition-all duration-200 p-2 sm:p-3"
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base truncate">Productos</div>
                  <div className="text-xs opacity-90 truncate">Gestionar inventario</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/encargos')}
                className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 btn-gradient-secondary hover:scale-105 transition-all duration-200 p-2 sm:p-3"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base truncate">Encargos</div>
                  <div className="text-xs opacity-90 truncate">Gestionar pedidos</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/empleados')}
                className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 btn-gradient-accent hover:scale-105 transition-all duration-200 p-2 sm:p-3"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base truncate">Empleados</div>
                  <div className="text-xs opacity-90 truncate">Gestionar personal</div>
                </div>
              </Button>
              <Button 
                onClick={() => navigate('/fichajes')}
                className="h-12 sm:h-14 justify-start gap-2 sm:gap-3 highlight-primary hover:scale-105 transition-all duration-200 p-2 sm:p-3"
              >
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base truncate">Fichajes</div>
                  <div className="text-xs opacity-90 truncate">Control de horarios</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Información sobre el estado actual del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inventario</span>
                  <span className="text-sm text-muted-foreground">{stats.productos} productos</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: "75%" }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Encargos Activos</span>
                  <span className="text-sm text-muted-foreground">{stats.encargos} en proceso</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary transition-all duration-1000" style={{ width: "60%" }} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Estado de Incidencias</span>
                  <span className="text-sm text-muted-foreground">{stats.incidenciasAbiertas} abiertas</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-destructive transition-all duration-1000" style={{ width: `${stats.incidenciasAbiertas > 0 ? 40 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cobros Pendientes</span>
                  <span className="text-sm text-muted-foreground">{stats.totalFacturasPendientes.toFixed(2)}€</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000" style={{ width: "45%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
