import { useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = () => {
  useEffect(() => {
    // Configurar listeners para cambios en la base de datos
    const setupNotificationListeners = () => {
      // Listener para encargos
      const encargosSubscription = supabase
        .channel('encargos_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'encargos',
            filter: 'estado=eq.listo'
          },
          async (payload) => {
            console.log('Encargo listo detectado:', payload);
            await handleEncargoListo(payload.new);
          }
        )
        .subscribe();

      // Listener para productos con stock bajo
      const productosSubscription = supabase
        .channel('productos_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'productos'
          },
          async (payload) => {
            console.log('Producto actualizado:', payload);
            await handleStockBajo(payload.new);
          }
        )
        .subscribe();

      // Listener para incidencias
      const incidenciasSubscription = supabase
        .channel('incidencias_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'incidencias'
          },
          async (payload) => {
            console.log('Nueva incidencia detectada:', payload);
            await handleNuevaIncidencia(payload.new);
          }
        )
        .subscribe();

      return () => {
        encargosSubscription.unsubscribe();
        productosSubscription.unsubscribe();
        incidenciasSubscription.unsubscribe();
      };
    };

    const cleanup = setupNotificationListeners();

    return cleanup;
  }, []);

  const handleEncargoListo = async (encargo: any) => {
    try {
      // Obtener información del cliente
      const { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', encargo.cliente_id)
        .single();

      if (!cliente) return;

      // Obtener todos los usuarios admin para notificar
      const { data: admins } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          auth.users(email)
        `)
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          // Notificar al admin por email
          await notificationService.sendTemplateNotification(
            'encargo_listo',
            'email',
            admin.auth.users.email,
            {
              encargo_id: encargo.id,
              cliente_nombre: cliente.nombre,
              producto: encargo.producto_descripcion,
              total: encargo.precio_total,
              fecha_entrega: encargo.fecha_entrega ? new Date(encargo.fecha_entrega).toLocaleDateString('es-ES') : 'No especificada'
            },
            admin.user_id
          );
        }
      }

      // Notificar al cliente si tiene email
      if (cliente.email) {
        await notificationService.sendTemplateNotification(
          'encargo_listo',
          'email',
          cliente.email,
          {
            encargo_id: encargo.id,
            cliente_nombre: cliente.nombre,
            producto: encargo.producto_descripcion,
            total: encargo.precio_total,
            fecha_entrega: encargo.fecha_entrega ? new Date(encargo.fecha_entrega).toLocaleDateString('es-ES') : 'No especificada'
          }
        );
      }

      // Notificar al cliente por SMS si tiene teléfono
      if (cliente.telefono) {
        await notificationService.sendTemplateNotification(
          'encargo_listo',
          'sms',
          cliente.telefono,
          {
            encargo_id: encargo.id,
            cliente_nombre: cliente.nombre,
            total: encargo.precio_total
          }
        );
      }

      // Notificar al cliente por WhatsApp si tiene teléfono
      if (cliente.telefono) {
        await notificationService.sendTemplateNotification(
          'encargo_listo',
          'whatsapp',
          cliente.telefono,
          {
            encargo_id: encargo.id,
            cliente_nombre: cliente.nombre,
            producto: encargo.producto_descripcion,
            total: encargo.precio_total,
            fecha_entrega: encargo.fecha_entrega ? new Date(encargo.fecha_entrega).toLocaleDateString('es-ES') : 'No especificada'
          }
        );
      }

    } catch (error) {
      console.error('Error enviando notificación de encargo listo:', error);
    }
  };

  const handleStockBajo = async (producto: any) => {
    try {
      // Solo notificar si el stock es menor o igual a 3
      if (producto.stock > 3) return;

      // Obtener todos los usuarios admin
      const { data: admins } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          auth.users(email)
        `)
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          // Notificar por email
          await notificationService.sendTemplateNotification(
            'stock_bajo',
            'email',
            admin.auth.users.email,
            {
              producto: producto.nombre,
              stock_actual: producto.stock,
              stock_minimo: 3
            },
            admin.user_id
          );

          // Notificar por SMS
          await notificationService.sendTemplateNotification(
            'stock_bajo',
            'sms',
            admin.auth.users.email, // En un caso real, tendrías el teléfono del admin
            {
              producto: producto.nombre,
              stock_actual: producto.stock
            },
            admin.user_id
          );
        }
      }

    } catch (error) {
      console.error('Error enviando notificación de stock bajo:', error);
    }
  };

  const handleNuevaIncidencia = async (incidencia: any) => {
    try {
      // Obtener información del empleado
      const { data: empleado } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', incidencia.user_id)
        .single();

      // Obtener todos los usuarios admin
      const { data: admins } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          auth.users(email)
        `)
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          // Notificar por email
          await notificationService.sendTemplateNotification(
            'incidencia_nueva',
            'email',
            admin.auth.users.email,
            {
              empleado_nombre: empleado?.nombre || 'Empleado',
              tipo_incidencia: incidencia.tipo,
              descripcion: incidencia.descripcion,
              fecha: new Date(incidencia.created_at).toLocaleDateString('es-ES')
            },
            admin.user_id
          );

          // Notificar por SMS
          await notificationService.sendTemplateNotification(
            'incidencia_nueva',
            'sms',
            admin.auth.users.email, // En un caso real, tendrías el teléfono del admin
            {
              empleado_nombre: empleado?.nombre || 'Empleado',
              tipo_incidencia: incidencia.tipo
            },
            admin.user_id
          );
        }
      }

    } catch (error) {
      console.error('Error enviando notificación de incidencia:', error);
    }
  };

  return {
    // Funciones manuales para testing
    sendTestNotification: async (type: string, channel: 'email' | 'sms' | 'whatsapp', recipient: string, variables: any) => {
      return await notificationService.sendTemplateNotification(type, channel, recipient, variables);
    }
  };
};
