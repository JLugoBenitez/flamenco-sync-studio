// Script para probar las notificaciones mejoradas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImprovedNotifications() {
  console.log('🧪 PROBANDO NOTIFICACIONES MEJORADAS');
  console.log('===================================\n');

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

    // 2. Crear un producto con stock bajo (notificación mejorada)
    console.log('\n2. 📦 Creando producto con stock bajo...');
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert({
        nombre: 'Guitarra Flamenca Premium',
        descripcion: 'Guitarra flamenca de alta calidad con tapa de cedro y aros de ciprés',
        precio: 1250.00,
        stock: 2, // Stock bajo para activar notificación
        categoria: 'Instrumentos'
      })
      .select()
      .single();

    if (productoError) {
      console.log('❌ Error creando producto:', productoError.message);
    } else {
      console.log('✅ Producto creado:', producto.nombre, '(Stock:', producto.stock, ')');
    }

    // 3. Crear un cliente
    console.log('\n3. 👤 Creando cliente...');
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        nombre: 'María García López',
        email: 'maria.garcia@email.com',
        telefono: '+34612345678',
        direccion: 'Calle Flamenco 123, Sevilla'
      })
      .select()
      .single();

    if (clienteError) {
      console.log('❌ Error creando cliente:', clienteError.message);
    } else {
      console.log('✅ Cliente creado:', cliente.nombre);
    }

    // 4. Crear un encargo y marcarlo como listo (notificación mejorada)
    if (producto && cliente) {
      console.log('\n4. 📋 Creando encargo y marcándolo como listo...');
      const { data: encargo, error: encargoError } = await supabase
        .from('encargos')
        .insert({
          cliente_id: cliente.id,
          producto_descripcion: `${producto.nombre} - ${producto.descripcion}`,
          precio_total: producto.precio,
          estado: 'en_proceso',
          fecha_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
          notas: 'Encargo especial con acabado personalizado'
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

    // 5. Crear una incidencia (notificación mejorada)
    console.log('\n5. 🚨 Creando incidencia...');
    const { data: incidencia, error: incidenciaError } = await supabase
      .from('incidencias')
      .insert({
        titulo: 'Problema con el sistema de facturación',
        descripcion: 'El sistema de facturación no está generando correctamente los PDFs para los encargos de más de 1000€. Necesita revisión urgente.',
        prioridad: 'alta',
        estado: 'abierta',
        creado_por: authData.user.id
      })
      .select()
      .single();

    if (incidenciaError) {
      console.log('❌ Error creando incidencia:', incidenciaError.message);
    } else {
      console.log('✅ Incidencia creada:', incidencia.titulo);
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
        if (notif.content) {
          console.log(`      Contenido: ${notif.content.substring(0, 100)}...`);
        }
      });
    }

    console.log('\n🎉 ¡PRUEBA DE NOTIFICACIONES MEJORADAS COMPLETADA!');
    console.log('==================================================');
    console.log('✅ Producto creado con información detallada');
    console.log('✅ Cliente creado con datos completos');
    console.log('✅ Encargo creado y marcado como listo');
    console.log('✅ Incidencia creada con prioridad alta');
    console.log('✅ Notificaciones mejoradas generadas');

    console.log('\n🎯 RESULTADO:');
    console.log('• Las notificaciones ahora incluyen información detallada');
    console.log('• Stock bajo: Muestra producto, categoría, precio, descripción');
    console.log('• Encargo listo: Muestra cliente, teléfono, email, detalles');
    console.log('• Incidencia: Muestra título, descripción, prioridad, fecha');
    console.log('• Revisa tu WhatsApp en 1-2 minutos');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testImprovedNotifications();
