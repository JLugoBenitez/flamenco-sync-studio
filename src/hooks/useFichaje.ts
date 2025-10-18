import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FichajeActivo {
  id: string;
  empleado_id: string;
  empleado_nombre: string;
  fecha: string;
  hora_entrada: string;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  created_at: string;
}

interface Fichaje {
  id: string;
  empleado_id: string;
  empleado_nombre: string;
  fecha: string;
  hora_entrada: string;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  created_at: string;
}

export const useFichaje = () => {
  const [fichajeActivo, setFichajeActivo] = useState<FichajeActivo | null>(null);
  const [fichajes, setFichajes] = useState<Fichaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const checkFichajeActivo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_active_fichaje_mejorado', {
        usuario_id: user.id
      });

      if (error) {
        console.error("Error al verificar fichaje activo:", error);
        return;
      }

      if (data && data.length > 0) {
        setFichajeActivo(data[0]);
      } else {
        setFichajeActivo(null);
      }
    } catch (error) {
      console.error("Error en checkFichajeActivo:", error);
    }
  };

  const cargarFichajes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_fichajes_usuario', {
        usuario_id: user.id
      });

      if (error) {
        console.error("Error al cargar fichajes:", error);
        return;
      }

      if (data && data.length > 0) {
        setFichajes(data);
      } else {
        setFichajes([]);
      }
    } catch (error) {
      console.error("Error en cargarFichajes:", error);
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
        toast.error("Usuario no autenticado");
        return;
      }

      const { data, error } = await supabase.rpc('fichar_entrada_mejorada', {
        usuario_id: user.id
      });

      if (error) {
        console.error("Error al fichar entrada:", error);
        toast.error(`Error al registrar entrada: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        const fichaje = data[0];
        toast.success(`Entrada registrada correctamente - ${fichaje.empleado_nombre}`);
        setFichajeActivo(fichaje);
        await cargarFichajes(); // Recargar lista de fichajes
      } else {
        toast.error("Error al registrar entrada");
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
        toast.error("Usuario no autenticado");
        return;
      }

      const { data, error } = await supabase.rpc('fichar_salida_mejorada', {
        usuario_id: user.id
      });

      if (error) {
        console.error("Error al fichar salida:", error);
        toast.error(`Error al registrar salida: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        const fichaje = data[0];
        const horas = fichaje.horas_trabajadas ? fichaje.horas_trabajadas.toFixed(2) : '0.00';
        toast.success(`Salida registrada correctamente - ${fichaje.empleado_nombre} (${horas}h)`);
        setFichajeActivo(null);
        await cargarFichajes(); // Recargar lista de fichajes
      } else {
        toast.error("Error al registrar salida");
      }
    } catch (error) {
      console.error("Error en ficharSalida:", error);
      toast.error("Error al registrar salida");
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const eliminarFichaje = async (fichajeId: string) => {
    if (processing || loading) {
      toast.error("Ya se está procesando una acción");
      return;
    }
    
    setLoading(true);
    setProcessing(true);
    
    try {
      const { data, error } = await supabase.rpc('eliminar_fichaje', {
        p_fichaje_id: fichajeId
      });

      if (error) {
        console.error("Error al eliminar fichaje:", error);
        toast.error(`Error al eliminar fichaje: ${error.message}`);
        return;
      }

      if (data && data[0]?.success) {
        toast.success("Fichaje eliminado correctamente");
        await cargarFichajes(); // Recargar lista de fichajes
        await checkFichajeActivo(); // Verificar si hay fichaje activo
      } else {
        toast.error(data?.[0]?.error || "Error al eliminar fichaje");
      }
    } catch (error) {
      console.error("Error en eliminarFichaje:", error);
      toast.error("Error al eliminar fichaje");
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  useEffect(() => {
    checkFichajeActivo();
    cargarFichajes();
  }, []);

  return {
    fichajeActivo,
    fichajes,
    loading,
    ficharEntrada,
    ficharSalida,
    eliminarFichaje,
    checkFichajeActivo,
    cargarFichajes
  };
};

