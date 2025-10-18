import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'empleado' | 'cliente' | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al obtener rol del usuario:', error);
        setRole(null);
      } else if (data && 'role' in data) {
        setRole(data.role as UserRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error('Error al verificar rol:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === 'admin';
  const isEmpleado = role === 'empleado' || role === 'admin';
  const isCliente = role === 'cliente';

  const hasRole = async (requiredRole: UserRole): Promise<boolean> => {
    if (!requiredRole) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: requiredRole
      });

      return !error && Boolean(data);
    } catch {
      return false;
    }
  };

  return {
    role,
    loading,
    isAdmin,
    isEmpleado,
    isCliente,
    hasRole,
    refresh: fetchUserRole
  };
}
