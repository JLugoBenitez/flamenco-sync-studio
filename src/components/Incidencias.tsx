import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertCircle } from "lucide-react";

const Incidencias = () => {
  const incidencias = [
    { id: 1, titulo: "Talla incorrecta en encargo #245", asignado: "Laura Sánchez", prioridad: "alta", estado: "abierta", fecha: "2025-10-13" },
    { id: 2, titulo: "Stock agotado - Zapatos talla 37", asignado: "Pedro García", prioridad: "media", estado: "en_proceso", fecha: "2025-10-12" },
    { id: 3, titulo: "Cliente solicita cambio de color", asignado: "Elena Moreno", prioridad: "baja", estado: "resuelta", fecha: "2025-10-11" },
    { id: 4, titulo: "Error en sincronización WooCommerce", asignado: "Laura Sánchez", prioridad: "alta", estado: "abierta", fecha: "2025-10-13" },
    { id: 5, titulo: "Factura duplicada cliente #128", asignado: "Sofía Delgado", prioridad: "media", estado: "en_proceso", fecha: "2025-10-10" },
    { id: 6, titulo: "Retraso en entrega proveedor", asignado: "Pedro García", prioridad: "alta", estado: "abierta", fecha: "2025-10-12" }
  ];

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return <Badge variant="destructive">Alta</Badge>;
      case "media":
        return <Badge className="bg-yellow-600">Media</Badge>;
      default:
        return <Badge variant="outline">Baja</Badge>;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "abierta":
        return <Badge className="bg-red-600">Abierta</Badge>;
      case "en_proceso":
        return <Badge className="bg-blue-600">En Proceso</Badge>;
      case "resuelta":
        return <Badge className="bg-green-600">Resuelta</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Incidencias
          </h1>
          <p className="text-muted-foreground mt-2">
            Registro y seguimiento de problemas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Incidencia
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Abiertas</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{incidencias.filter(i => i.estado === 'abierta').length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">En Proceso</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{incidencias.filter(i => i.estado === 'en_proceso').length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Resueltas</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{incidencias.filter(i => i.estado === 'resuelta').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Todas las Incidencias</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidencias.map((incidencia) => (
                <TableRow key={incidencia.id}>
                  <TableCell className="font-medium">#{incidencia.id}</TableCell>
                  <TableCell>{incidencia.titulo}</TableCell>
                  <TableCell>{incidencia.asignado}</TableCell>
                  <TableCell>{getPrioridadBadge(incidencia.prioridad)}</TableCell>
                  <TableCell>{getEstadoBadge(incidencia.estado)}</TableCell>
                  <TableCell>{new Date(incidencia.fecha).toLocaleDateString('es-ES')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Incidencias;
