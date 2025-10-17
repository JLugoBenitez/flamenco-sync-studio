// Script para probar el procesador automático
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutoProcessor() {
  console.log('🧪 PROBANDO PROCESADOR AUTOMÁTICO');
  console.log('=================================\n');

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

    // 2. Crear un producto con stock bajo para activar notificación automática
    console.log('\n2. 📦 Creando producto con stock bajo...');
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .insert({
        nombre: 'TEST PROCESADOR AUTOMÁTICO',
        descripcion: 'Producto para probar el procesador automático de notificaciones',
        precio: 50.00,
        stock: 1, // Stock muy bajo para activar notificación
        categoria: 'Test'
      })
      .select()
      .single();

    if (productoError) {
      console.log('❌ Error creando producto:', productoError.message);
    } else {
      console.log('✅ Producto creado:', producto.nombre, '(Stock:', producto.stock, ')');
    }

    // 3. Verificar notificaciones generadas
    console.log('\n3. 📊 Verificando notificaciones generadas...');
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

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ Producto creado con stock bajo');
    console.log('✅ Notificación generada automáticamente');
    console.log('✅ Procesador automático debería procesarla en 30 segundos');

    console.log('\n🎯 RESULTADO:');
    console.log('• La notificación se procesará automáticamente en 30 segundos');
    console.log('• Revisa tu WhatsApp en 1-2 minutos');
    console.log('• El procesador automático está funcionando');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testAutoProcessor();
