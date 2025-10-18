import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Mail, Phone, Shield, AlertCircle, Users, UserCheck, UserX, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin";
import { toast } from "@/hooks/use-toast";
import { EmpleadoForm } from "./EmpleadoForm";
import { useUserRole } from "@/hooks/useUserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Empleados = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    setLoading(true);
    
    // Obtener profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      toast({ title: "Error", description: profilesError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Obtener roles
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast({ title: "Error", description: rolesError.message, variant: "destructive" });
    }

    // Combinar datos
    const empleadosConRoles = profilesData.map(profile => ({
      ...profile,
      user_roles: rolesData?.filter(r => r.user_id === profile.user_id) || []
    }));

    setEmpleados(empleadosConRoles);
    setLoading(false);
  };

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRolBadge = (roles: any[]) => {
    if (!roles || roles.length === 0) return <Badge variant="outline">Sin rol</Badge>;
    
    const rol = roles[0]?.role;
    switch (rol) {
      case "admin":
        return <Badge className="bg-primary">Administrador</Badge>;
      case "empleado":
        return <Badge variant="outline">Empleado</Badge>;
      case "cliente":
        return <Badge className="bg-secondary">Cliente</Badge>;
      default:
        return <Badge variant="outline">{rol}</Badge>;
    }
  };

  const eliminarEmpleado = async (empleadoId: string, userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este empleado? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      // Eliminar perfil usando cliente normal
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", empleadoId);

      if (profileError) throw profileError;

      // Eliminar rol usando cliente normal
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Eliminar usuario de auth usando cliente de administración
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) throw authError;

      toast({ title: "Empleado eliminado correctamente" });
      cargarEmpleados();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (roleLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Verificando permisos...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="heading-responsive font-bold text-primary-gradient">
          Empleados
        </h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a la gestión de empleados. Solo los administradores pueden gestionar empleados.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-responsive font-bold text-primary-gradient">
            Empleados
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión del equipo (Solo Administradores)
          </p>
        </div>
        <EmpleadoForm onSuccess={cargarEmpleados} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando empleados...</p>
        </div>
      ) : empleados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No hay empleados registrados
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                      {getRolBadge(empleado.user_roles)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarEmpleado(empleado.id, empleado.user_id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{empleado.email}</span>
                </div>
                {empleado.telefono && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{empleado.telefono}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Empleados;
