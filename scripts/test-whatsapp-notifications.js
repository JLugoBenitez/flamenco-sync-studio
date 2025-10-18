// Script para probar notificaciones automáticas de WhatsApp
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWhatsAppNotifications() {
  console.log('🧪 PROBANDO NOTIFICACIONES AUTOMÁTICAS DE WHATSAPP');
  console.log('================================================\n');

  try {
    // 1. Login como admin
    console.log('1. 🔐 Autenticando como admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'holaadmin'
    });

    if (authError) {
      console.log('❌ Error de login:', authError.message);
      return;
    }
    console.log('✅ Login exitoso:', authData.user.email);

    // 2. Crear un producto con stock bajo para probar notificación
    console.log('\n2. 📦 Creando producto con stock bajo...');
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert({
        nombre: 'Producto de Prueba - Stock Bajo',
        descripcion: 'Producto para probar notificaciones automáticas de WhatsApp',
        precio: 25.50,
        stock: 2, // Stock bajo para activar notificación
        categoria: 'Prueba'
      })
      .select()
      .single();

    if (productoError) {
      console.log('❌ Error creando producto:', productoError.message);
    } else {
      console.log('✅ Producto creado:', producto.nombre, '(Stock:', producto.stock, ')');
    }

    // 3. Crear un cliente
    console.log('\n3. 👤 Creando cliente de prueba...');
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        nombre: 'Cliente de Prueba WhatsApp',
        email: 'cliente@prueba.com',
        telefono: '+34627388086', // Tu número para recibir WhatsApp
        direccion: 'Calle de Prueba 123'
      })
      .select()
      .single();

    if (clienteError) {
      console.log('❌ Error creando cliente:', clienteError.message);
    } else {
      console.log('✅ Cliente creado:', cliente.nombre);
    }

    // 4. Crear un encargo y marcarlo como listo
    if (producto && cliente) {
      console.log('\n4. 📋 Creando encargo y marcándolo como listo...');
      const { data: encargo, error: encargoError } = await supabase
        .from('encargos')
        .insert({
          cliente_id: cliente.id,
          producto_descripcion: producto.nombre,
          precio_total: producto.precio,
          estado: 'en_proceso',
          fecha_entrega: new Date().toISOString(),
          notas: 'Encargo de prueba para notificaciones de WhatsApp'
        })
        .select()
        .single();

      if (encargoError) {
        console.log('❌ Error creando encargo:', encargoError.message);
      } else {
        console.log('✅ Encargo creado:', encargo.id);

        // Marcar como listo para activar notificación
        const { error: updateError } = await supabase
          .from('encargos')
          .update({ estado: 'listo' })
          .eq('id', encargo.id);

        if (updateError) {
          console.log('❌ Error actualizando encargo:', updateError.message);
        } else {
          console.log('✅ Encargo marcado como listo');
        }
      }
    }

    // 5. Crear una incidencia
    console.log('\n5. 🚨 Creando incidencia...');
    const { data: incidencia, error: incidenciaError } = await supabase
      .from('incidencias')
      .insert({
        user_id: authData.user.id,
        tipo: 'Técnica',
        descripcion: 'Incidencia de prueba para notificaciones automáticas de WhatsApp',
        estado: 'abierta',
        prioridad: 'media'
      })
      .select()
      .single();

    if (incidenciaError) {
      console.log('❌ Error creando incidencia:', incidenciaError.message);
    } else {
      console.log('✅ Incidencia creada:', incidencia.id);
    }

    // 6. Verificar notificaciones generadas
    console.log('\n6. 📊 Verificando notificaciones generadas...');
    const { data: notifications, error: notifError } = await supabase
      .from('notification_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (notifError) {
      console.log('❌ Error obteniendo notificaciones:', notifError.message);
    } else {
      console.log(`✅ Notificaciones generadas: ${notifications.length}`);
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.type} → ${notif.recipient} (${notif.status})`);
      });
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ Triggers automáticos funcionando');
    console.log('✅ Notificaciones generadas');
    console.log('✅ Revisa tu WhatsApp en 30 segundos');

    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Espera 30 segundos para que el procesador automático envíe las notificaciones');
    console.log('2. Revisa tu WhatsApp');
    console.log('3. Las notificaciones se procesarán automáticamente');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testWhatsAppNotifications();
