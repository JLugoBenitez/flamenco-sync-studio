import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut as LogOutIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const FichajeActual = ({ onUpdate }: { onUpdate: () => void }) => {
  const [fichajeActivo, setFichajeActivo] = useState<any>(null);
  const [horaActual, setHoraActual] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) verificarFichajeActivo();
  }, [user]);

  const verificarFichajeActivo = async () => {
    if (!user) return;
    
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("fichajes")
      .select("*")
      .eq("user_id", user.id)
      .eq("fecha", hoy)
      .is("hora_salida", null)
      .maybeSingle();

    setFichajeActivo(data);
  };

  const ficharEntrada = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const ahora = new Date();
      const hoy = ahora.toISOString().split('T')[0];
      const hora = ahora.toTimeString().split(' ')[0];

      const { error } = await supabase.from("fichajes").insert({
        fecha: hoy,
        hora_entrada: hora,
        user_id: user.id,
      });

      if (error) throw error;

      toast({ title: "Entrada registrada", description: `Hora de entrada: ${hora}` });
      verificarFichajeActivo();
      onUpdate();
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
      const hora = ahora.toTimeString().split(' ')[0];
      
      const entrada = new Date(`1970-01-01T${fichajeActivo.hora_entrada}`);
      const salida = new Date(`1970-01-01T${hora}`);
      const horasDiff = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from("fichajes")
        .update({
          hora_salida: hora,
          horas_trabajadas: parseFloat(horasDiff.toFixed(2)),
        })
        .eq("id", fichajeActivo.id);

      if (error) throw error;

      toast({ title: "Salida registrada", description: `Horas trabajadas: ${horasDiff.toFixed(2)}h` });
      setFichajeActivo(null);
      onUpdate();
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
          Fichaje - {horaActual.toLocaleTimeString('es-ES')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          {!fichajeActivo ? (
            <Button onClick={ficharEntrada} disabled={loading} className="flex-1 gap-2">
              <LogIn className="h-4 w-4" />
              Fichar Entrada
            </Button>
          ) : (
            <Button onClick={ficharSalida} disabled={loading} variant="destructive" className="flex-1 gap-2">
              <LogOutIcon className="h-4 w-4" />
              Fichar Salida
            </Button>
          )}
        </div>

        {fichajeActivo && (
          <div className="text-sm text-center p-3 bg-muted rounded-lg">
            Entrada: {fichajeActivo.hora_entrada}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
