import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FichajeActual } from "./FichajeActual";
import { useAuth } from "@/contexts/AuthContext";

const Fichajes = () => {
  const [fichajes, setFichajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    cargarFichajes();
  }, []);

  const cargarFichajes = async () => {
    setLoading(true);
    
    let query = supabase
      .from("fichajes")
      .select(`
        *,
        profiles(nombre)
      `)
      .order("fecha", { ascending: false })
      .order("hora_entrada", { ascending: false });

    if (!isAdmin && user) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setFichajes(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Fichajes
        </h1>
        <p className="text-muted-foreground mt-2">
          Control de jornada laboral
        </p>
      </div>

      <FichajeActual onUpdate={cargarFichajes} />

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Historial de Fichajes</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Empleado</TableHead>}
                <TableHead>Fecha</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                    Cargando fichajes...
                  </TableCell>
                </TableRow>
              ) : fichajes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    No hay fichajes registrados
                  </TableCell>
                </TableRow>
              ) : (
                fichajes.map((fichaje) => (
                  <TableRow key={fichaje.id}>
                    {isAdmin && <TableCell className="font-medium">{fichaje.profiles?.nombre || "N/A"}</TableCell>}
                    <TableCell>{new Date(fichaje.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>{fichaje.hora_entrada}</TableCell>
                    <TableCell>{fichaje.hora_salida || '-'}</TableCell>
                    <TableCell className="text-right">
                      {fichaje.horas_trabajadas ? `${parseFloat(fichaje.horas_trabajadas).toFixed(2)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      {fichaje.hora_salida ? (
                        <Badge className="bg-green-600">Completado</Badge>
                      ) : (
                        <Badge className="bg-blue-600">En curso</Badge>
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
