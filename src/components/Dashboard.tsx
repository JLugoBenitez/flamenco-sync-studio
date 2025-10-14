import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Users, FileText, AlertCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
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
      supabase.from("productos").select("id", { count: "exact", head: true }),
      supabase.from("encargos").select("id", { count: "exact", head: true }).neq("estado", "entregado"),
      supabase.from("incidencias").select("id", { count: "exact", head: true }).eq("estado", "abierta"),
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
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Panel de Control
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestión integral de FlamencoPuro
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
          <CardDescription>Vista general del estado de tu negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Inventario</span>
                <span className="text-sm text-muted-foreground">{stats.productos} productos</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: "75%" }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Encargos Activos</span>
                <span className="text-sm text-muted-foreground">{stats.encargos} en proceso</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all" style={{ width: "60%" }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Estado de Incidencias</span>
                <span className="text-sm text-muted-foreground">{stats.incidenciasAbiertas} abiertas</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-destructive transition-all" style={{ width: `${stats.incidenciasAbiertas > 0 ? 40 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cobros Pendientes</span>
                <span className="text-sm text-muted-foreground">{stats.totalFacturasPendientes.toFixed(2)}€</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
