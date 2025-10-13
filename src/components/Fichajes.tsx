import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

const Fichajes = () => {
  const fichajes = [
    { id: 1, empleado: "Laura Sánchez", fecha: "2025-10-13", entrada: "09:00", salida: "18:00", horas: "9h 0m", estado: "completo" },
    { id: 2, empleado: "Pedro García", fecha: "2025-10-13", entrada: "09:15", salida: "17:45", horas: "8h 30m", estado: "completo" },
    { id: 3, empleado: "Elena Moreno", fecha: "2025-10-13", entrada: "09:05", salida: "-", horas: "En turno", estado: "activo" },
    { id: 4, empleado: "Sofía Delgado", fecha: "2025-10-13", entrada: "10:00", salida: "-", horas: "En turno", estado: "activo" },
    { id: 5, empleado: "Miguel Ángel Vega", fecha: "2025-10-13", entrada: "09:00", salida: "14:00", horas: "5h 0m", estado: "completo" },
    { id: 6, empleado: "Laura Sánchez", fecha: "2025-10-12", entrada: "09:00", salida: "18:30", horas: "9h 30m", estado: "completo" },
    { id: 7, empleado: "Pedro García", fecha: "2025-10-12", entrada: "09:20", salida: "18:00", horas: "8h 40m", estado: "completo" },
    { id: 8, empleado: "Elena Moreno", fecha: "2025-10-12", entrada: "09:00", salida: "17:00", horas: "8h 0m", estado: "completo" }
  ];

  const totalHoysActivos = fichajes.filter(f => f.estado === 'activo').length;
  const totalHorasHoy = fichajes
    .filter(f => f.fecha === "2025-10-13" && f.estado === 'completo')
    .reduce((sum, f) => {
      const [h] = f.horas.split('h');
      return sum + parseInt(h);
    }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Control de Fichajes
        </h1>
        <p className="text-muted-foreground mt-2">
          Registro de entradas y salidas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Empleados Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHoysActivos}</div>
            <p className="text-xs text-muted-foreground mt-1">En turno ahora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              Horas Trabajadas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHorasHoy}h</div>
            <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Promedio Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.5h</div>
            <p className="text-xs text-muted-foreground mt-1">Por empleado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Fichajes</CardTitle>
        </CardHeader>
        <CardContent>
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
              {fichajes.map((fichaje) => (
                <TableRow key={fichaje.id}>
                  <TableCell className="font-medium">{fichaje.empleado}</TableCell>
                  <TableCell>{new Date(fichaje.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{fichaje.entrada}</TableCell>
                  <TableCell>{fichaje.salida}</TableCell>
                  <TableCell>{fichaje.horas}</TableCell>
                  <TableCell>
                    {fichaje.estado === 'activo' ? (
                      <Badge className="bg-green-600">En Turno</Badge>
                    ) : (
                      <Badge variant="outline">Completado</Badge>
                    )}
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

export default Fichajes;
