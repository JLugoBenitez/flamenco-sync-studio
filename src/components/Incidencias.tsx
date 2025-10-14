import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { IncidenciaForm } from "./IncidenciaForm";

const Incidencias = () => {
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const cargarIncidencias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("incidencias")
      .select("*")
      .order("fecha_creacion", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setIncidencias(data || []);
    }
    setLoading(false);
  };

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
        <IncidenciaForm onSuccess={cargarIncidencias} />
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
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Cargando incidencias...
                  </TableCell>
                </TableRow>
              ) : incidencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay incidencias registradas
                  </TableCell>
                </TableRow>
              ) : (
                incidencias.map((incidencia) => (
                  <TableRow key={incidencia.id}>
                    <TableCell className="font-medium">#{incidencia.id}</TableCell>
                    <TableCell>{incidencia.titulo}</TableCell>
                    <TableCell>{getPrioridadBadge(incidencia.prioridad)}</TableCell>
                    <TableCell>{getEstadoBadge(incidencia.estado)}</TableCell>
                    <TableCell>{new Date(incidencia.fecha_creacion).toLocaleDateString('es-ES')}</TableCell>
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

export default Incidencias;
