import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const FichajeActual = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [fichajeActivo, setFichajeActivo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    const { data } = await supabase
      .from("empleados")
      .select("*")
      .eq("activo", true)
      .order("nombre");
    if (data) setEmpleados(data);
  };

  const checkFichajeActivo = async (empleadoId: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("fichajes")
      .select("*")
      .eq("empleado_id", empleadoId)
      .eq("fecha", hoy)
      .is("hora_salida", null)
      .single();
    
    setFichajeActivo(data);
  };

  useEffect(() => {
    if (selectedEmpleado) {
      checkFichajeActivo(selectedEmpleado);
    }
  }, [selectedEmpleado]);

  const ficharEntrada = async () => {
    if (!selectedEmpleado) return;
    setLoading(true);

    try {
      const ahora = new Date();
      const { error } = await supabase.from("fichajes").insert({
        empleado_id: selectedEmpleado,
        fecha: ahora.toISOString().split('T')[0],
        hora_entrada: ahora.toTimeString().split(' ')[0]
      });

      if (error) throw error;

      toast({ title: "Entrada registrada correctamente" });
      checkFichajeActivo(selectedEmpleado);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const ficharSalida = async () => {
    if (!fichajeActivo) return;
    setLoading(true);

    try {
      const ahora = new Date();
      const entrada = new Date(`1970-01-01T${fichajeActivo.hora_entrada}`);
      const salida = new Date(`1970-01-01T${ahora.toTimeString().split(' ')[0]}`);
      const horasDiff = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from("fichajes")
        .update({
          hora_salida: ahora.toTimeString().split(' ')[0],
          horas_trabajadas: parseFloat(horasDiff.toFixed(2))
        })
        .eq("id", fichajeActivo.id);

      if (error) throw error;

      toast({ title: "Salida registrada correctamente" });
      setFichajeActivo(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Fichaje Rápido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedEmpleado} onValueChange={setSelectedEmpleado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar empleado" />
            </SelectTrigger>
            <SelectContent>
              {empleados.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmpleado && (
          <div className="flex gap-3">
            {!fichajeActivo ? (
              <Button
                onClick={ficharEntrada}
                disabled={loading}
                className="flex-1 gap-2"
              >
                <LogIn className="h-4 w-4" />
                Fichar Entrada
              </Button>
            ) : (
              <Button
                onClick={ficharSalida}
                disabled={loading}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Fichar Salida
              </Button>
            )}
          </div>
        )}

        {fichajeActivo && (
          <div className="text-sm text-muted-foreground text-center p-3 bg-muted rounded-lg">
            Entrada registrada a las {fichajeActivo.hora_entrada}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
