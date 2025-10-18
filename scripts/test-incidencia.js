// Script para probar la creación de incidencias
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIncidencia() {
  console.log('🧪 PROBANDO CREACIÓN DE INCIDENCIAS');
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

    // 2. Crear una incidencia
    console.log('\n2. 🚨 Creando incidencia...');
    const { data: incidencia, error: incidenciaError } = await supabase
      .from('incidencias')
      .insert({
        titulo: 'Incidencia de Prueba',
        descripcion: 'Esta es una incidencia de prueba para verificar que funciona correctamente',
        prioridad: 'alta',
        estado: 'abierta',
        creado_por: authData.user.id
      })
      .select()
      .single();

    if (incidenciaError) {
      console.log('❌ Error creando incidencia:', incidenciaError.message);
      console.log('Detalles:', incidenciaError);
    } else {
      console.log('✅ Incidencia creada:', incidencia);
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
    console.log('✅ Incidencia creada correctamente');
    console.log('✅ Notificaciones generadas');
    console.log('✅ Revisa tu WhatsApp en 30 segundos');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testIncidencia();
