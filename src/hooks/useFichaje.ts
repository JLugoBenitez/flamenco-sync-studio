import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FichajeActivo {
  id: string;
  empleado_id: string | null;
  fecha_entrada: string;
  fecha_salida: string | null;
  horas_trabajadas: number | null;
}

export const useFichaje = () => {
  const [fichajeActivo, setFichajeActivo] = useState<FichajeActivo | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const checkFichajeActivo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_active_fichaje', {
        p_user_id: user.id
      });

      if (error) {
        console.error("Error al verificar fichaje activo:", error);
        return;
      }

      // Las funciones retornan JSON envuelto en pgrst_call
      if (data && Array.isArray(data) && data.length > 0 && data[0]?.pgrst_call && !data[0].pgrst_call.error) {
        setFichajeActivo(data[0].pgrst_call);
      } else {
        setFichajeActivo(null);
      }
    } catch (error) {
      console.error("Error en checkFichajeActivo:", error);
    }
  };

  const ficharEntrada = async () => {
    if (processing || loading) {
      toast.error("Ya se está procesando una acción");
      return;
    }
    
    setLoading(true);
    setProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No hay usuario autenticado");
        return;
      }

      const { data, error } = await supabase.rpc('fichar_entrada', {
        p_empleado_id: null
      });

      if (error) {
        console.error("Error al fichar entrada:", error);
        toast.error(`Error al registrar entrada: ${error.message}`);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0 && data[0]?.pgrst_call && !data[0].pgrst_call.error) {
        toast.success("Entrada registrada correctamente");
        setFichajeActivo(data[0].pgrst_call);
      } else {
        toast.error(data?.[0]?.pgrst_call?.error || "Error al registrar entrada");
      }
    } catch (error) {
      console.error("Error en ficharEntrada:", error);
      toast.error("Error al registrar entrada");
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const ficharSalida = async () => {
    if (processing || loading) {
      toast.error("Ya se está procesando una acción");
      return;
    }
    
    setLoading(true);
    setProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No hay usuario autenticado");
        return;
      }

      const { data, error } = await supabase.rpc('fichar_salida');

      if (error) {
        console.error("Error al fichar salida:", error);
        toast.error(`Error al registrar salida: ${error.message}`);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0 && data[0]?.pgrst_call && !data[0].pgrst_call.error) {
        toast.success("Salida registrada correctamente");
        setFichajeActivo(null);
      } else {
        toast.error(data?.[0]?.pgrst_call?.error || "Error al registrar salida");
      }
    } catch (error) {
      console.error("Error en ficharSalida:", error);
      toast.error("Error al registrar salida");
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  useEffect(() => {
    checkFichajeActivo();
  }, []);

  return {
    fichajeActivo,
    loading,
    ficharEntrada,
    ficharSalida,
    checkFichajeActivo
  };
};

