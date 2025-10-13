import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye } from "lucide-react";

const Encargos = () => {
  const encargos = [
    { id: 245, cliente: "María González", producto: "Traje Personalizado Rojo", fecha: "2025-10-01", entrega: "2025-10-20", estado: "en_produccion", total: 750 },
    { id: 246, cliente: "Carmen Ruiz", producto: "Bata de Cola con Bordados", fecha: "2025-10-05", entrega: "2025-10-25", estado: "pendiente", total: 920 },
    { id: 247, cliente: "Ana Martínez", producto: "Conjunto Completo Niña", fecha: "2025-10-08", entrega: "2025-10-18", estado: "listo", total: 340 },
    { id: 248, cliente: "Isabel López", producto: "Traje Sevilla Negro", fecha: "2025-10-10", entrega: "2025-10-30", estado: "en_produccion", total: 680 },
    { id: 249, cliente: "Rosa Fernández", producto: "Mantón Bordado a Mano", fecha: "2025-10-11", entrega: "2025-11-05", estado: "pendiente", total: 450 }
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "listo":
        return <Badge className="bg-green-600">Listo para Entrega</Badge>;
      case "en_produccion":
        return <Badge className="bg-blue-600">En Producción</Badge>;
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>;
      case "entregado":
        return <Badge variant="secondary">Entregado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Encargos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de pedidos personalizados
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Encargo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{encargos.filter(e => e.estado === 'pendiente').length}</p>
              <p className="text-sm text-muted-foreground mt-1">Pendientes</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{encargos.filter(e => e.estado === 'en_produccion').length}</p>
              <p className="text-sm text-muted-foreground mt-1">En Producción</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{encargos.filter(e => e.estado === 'listo').length}</p>
              <p className="text-sm text-muted-foreground mt-1">Listos</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-secondary">{encargos.reduce((sum, e) => sum + e.total, 0)}€</p>
              <p className="text-sm text-muted-foreground mt-1">Total Activos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Encargo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Fecha Pedido</TableHead>
                <TableHead>Fecha Entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encargos.map((encargo) => (
                <TableRow key={encargo.id}>
                  <TableCell className="font-medium">#{encargo.id}</TableCell>
                  <TableCell>{encargo.cliente}</TableCell>
                  <TableCell>{encargo.producto}</TableCell>
                  <TableCell>{new Date(encargo.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{new Date(encargo.entrega).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{getEstadoBadge(encargo.estado)}</TableCell>
                  <TableCell className="text-right font-semibold">{encargo.total}€</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Encargos;
