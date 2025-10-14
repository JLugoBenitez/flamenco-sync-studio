import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EncargosForm } from "./EncargosForm";

const Encargos = () => {
  const [encargos, setEncargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEncargos();
  }, []);

  const cargarEncargos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("encargos")
      .select(`
        *,
        clientes(nombre)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEncargos(data || []);
    }
    setLoading(false);
  };

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
        <EncargosForm onSuccess={cargarEncargos} />
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Cargando encargos...</TableCell>
                </TableRow>
              ) : encargos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay encargos registrados
                  </TableCell>
                </TableRow>
              ) : (
                encargos.map((encargo) => (
                  <TableRow key={encargo.id}>
                    <TableCell className="font-medium">#{encargo.id}</TableCell>
                    <TableCell>{encargo.clientes?.nombre || "N/A"}</TableCell>
                    <TableCell>{encargo.producto_descripcion}</TableCell>
                    <TableCell>{new Date(encargo.fecha_pedido).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      {encargo.fecha_entrega ? new Date(encargo.fecha_entrega).toLocaleDateString('es-ES') : 'Sin fecha'}
                    </TableCell>
                    <TableCell>{getEstadoBadge(encargo.estado)}</TableCell>
                    <TableCell className="text-right font-semibold">{parseFloat(encargo.precio_total).toFixed(2)}€</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Encargos;
