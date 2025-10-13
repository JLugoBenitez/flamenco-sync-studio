import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FichajeActual } from "./FichajeActual";

const Fichajes = () => {
  const [fichajes, setFichajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarFichajes();
  }, []);

  const cargarFichajes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("fichajes")
      .select(`
        *,
        empleados (nombre)
      `)
      .order("fecha", { ascending: false })
      .order("hora_entrada", { ascending: false })
      .limit(20);

    if (data) setFichajes(data);
    setLoading(false);
  };

  const totalActivos = fichajes.filter(f => !f.hora_salida).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Control de Fichajes
        </h1>
        <p className="text-muted-foreground mt-2">
          Registro de entradas y salidas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Empleados Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActivos}</div>
            <p className="text-xs text-muted-foreground mt-1">En turno ahora</p>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <FichajeActual />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Fichajes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando fichajes...
                  </TableCell>
                </TableRow>
              ) : fichajes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay fichajes registrados
                  </TableCell>
                </TableRow>
              ) : (
                fichajes.map((fichaje) => (
                  <TableRow key={fichaje.id}>
                    <TableCell className="font-medium">{fichaje.empleados?.nombre}</TableCell>
                    <TableCell>{new Date(fichaje.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>{fichaje.hora_entrada}</TableCell>
                    <TableCell>{fichaje.hora_salida || '-'}</TableCell>
                    <TableCell>{fichaje.horas_trabajadas ? `${fichaje.horas_trabajadas}h` : 'En turno'}</TableCell>
                    <TableCell>
                      {!fichaje.hora_salida ? (
                        <Badge className="bg-green-600">En Turno</Badge>
                      ) : (
                        <Badge variant="outline">Completado</Badge>
                      )}
                    </TableCell>
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

export default Fichajes;
