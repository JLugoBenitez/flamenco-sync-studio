import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Mail, Phone } from "lucide-react";

const Empleados = () => {
  const empleados = [
    { id: 1, nombre: "Laura Sánchez", rol: "Admin", email: "laura@flamencropuro.es", telefono: "612 345 678", activo: true },
    { id: 2, nombre: "Pedro García", rol: "Comercial", email: "pedro@flamencropuro.es", telefono: "623 456 789", activo: true },
    { id: 3, nombre: "Elena Moreno", rol: "Empleado", email: "elena@flamencropuro.es", telefono: "634 567 890", activo: true },
    { id: 4, nombre: "Carlos Jiménez", rol: "Empleado", email: "carlos@flamencropuro.es", telefono: "645 678 901", activo: false },
    { id: 5, nombre: "Sofía Delgado", rol: "Comercial", email: "sofia@flamencropuro.es", telefono: "656 789 012", activo: true },
    { id: 6, nombre: "Miguel Ángel Vega", rol: "Empleado", email: "miguel@flamencropuro.es", telefono: "667 890 123", activo: true }
  ];

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case "Admin":
        return <Badge className="bg-primary">Administrador</Badge>;
      case "Comercial":
        return <Badge className="bg-secondary text-secondary-foreground">Comercial</Badge>;
      default:
        return <Badge variant="outline">Empleado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Empleados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión del equipo
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {empleados.map((empleado) => (
          <Card key={empleado.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-primary/70">
                    <AvatarFallback className="text-white font-semibold">
                      {getInitials(empleado.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{empleado.nombre}</h3>
                    {getRolBadge(empleado.rol)}
                  </div>
                </div>
                <Badge variant={empleado.activo ? "default" : "secondary"}>
                  {empleado.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{empleado.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{empleado.telefono}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Empleados;
