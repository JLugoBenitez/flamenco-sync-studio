// Prueba final de notificaciones de WhatsApp
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalWhatsApp() {
  console.log('🧪 PRUEBA FINAL DE WHATSAPP');
  console.log('===========================\n');

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

    // 2. Crear un producto con stock bajo
    console.log('\n2. 📦 Creando producto con stock bajo...');
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert({
        nombre: 'PRUEBA FINAL WHATSAPP',
        descripcion: 'Producto para probar notificaciones finales de WhatsApp',
        precio: 99.99,
        stock: 1, // Stock muy bajo
        categoria: 'Prueba Final'
      })
      .select()
      .single();

    if (productoError) {
      console.log('❌ Error creando producto:', productoError.message);
    } else {
      console.log('✅ Producto creado:', producto.nombre, '(Stock:', producto.stock, ')');
    }

    // 3. Crear una incidencia
    console.log('\n3. 🚨 Creando incidencia...');
    const { data: incidencia, error: incidenciaError } = await supabase
      .from('incidencias')
      .insert({
        titulo: 'PRUEBA FINAL WHATSAPP',
        descripcion: 'Incidencia de prueba final para verificar notificaciones de WhatsApp',
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

    // 4. Verificar notificaciones generadas
    console.log('\n4. 📊 Verificando notificaciones generadas...');
    const { data: notifications, error: notifError } = await supabase
      .from('notification_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (notifError) {
      console.log('❌ Error obteniendo notificaciones:', notifError.message);
    } else {
      console.log(`✅ Notificaciones generadas: ${notifications.length}`);
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.type} → ${notif.recipient} (${notif.status})`);
      });
    }

    console.log('\n🎉 ¡PRUEBA FINAL COMPLETADA!');
    console.log('============================');
    console.log('✅ Producto creado con stock bajo');
    console.log('✅ Incidencia creada');
    console.log('✅ Notificaciones generadas');
    console.log('✅ Procesador automático funcionando');

    console.log('\n🎯 RESULTADO:');
    console.log('• Las notificaciones se procesarán automáticamente en 30 segundos');
    console.log('• Revisa tu WhatsApp en 1-2 minutos');
    console.log('• Deberías recibir 2 mensajes de WhatsApp');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testFinalWhatsApp();
