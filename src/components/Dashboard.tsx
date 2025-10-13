import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Users, FileText, AlertCircle, ShoppingCart } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Ventas del Mes",
      value: "24,580€",
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Productos en Stock",
      value: "342",
      change: "-8 unidades",
      icon: Package,
      color: "text-secondary"
    },
    {
      title: "Encargos Activos",
      value: "28",
      change: "+5 nuevos",
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      title: "Incidencias Abiertas",
      value: "3",
      change: "-2 resueltas",
      icon: AlertCircle,
      color: "text-destructive"
    },
    {
      title: "Empleados",
      value: "12",
      change: "Activos hoy",
      icon: Users,
      color: "text-accent"
    },
    {
      title: "Facturas Pendientes",
      value: "15",
      change: "42,300€",
      icon: FileText,
      color: "text-muted-foreground"
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos movimientos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nueva venta registrada</p>
                  <p className="text-xs text-muted-foreground">Traje Sevilla Rojo - Talla 38</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 15 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-2 w-2 mt-2 rounded-full bg-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Stock actualizado</p>
                  <p className="text-xs text-muted-foreground">20 nuevas unidades recibidas</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Incidencia resuelta</p>
                  <p className="text-xs text-muted-foreground">Talla incorrecta en encargo #245</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 4 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Traje Sevilla Clásico", sales: 45, color: "bg-primary" },
                { name: "Mantón Bordado Oro", sales: 38, color: "bg-secondary" },
                { name: "Vestido Rocío Negro", sales: 32, color: "bg-accent" },
                { name: "Bata de Cola Roja", sales: 28, color: "bg-primary/70" },
                { name: "Conjunto Niña Lunares", sales: 24, color: "bg-secondary/70" }
              ].map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${product.color} transition-all`}
                        style={{ width: `${(product.sales / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{product.sales}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
