// Script simple para probar notificaciones
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotifications() {
  console.log('🧪 Probando sistema de notificaciones...\n');

  try {
    // 1. Probar acceso a configuración
    console.log('1. Probando acceso a notification_config...');
    const { data: config, error: configError } = await supabase
      .from('notification_config')
      .select('*');
    
    if (configError) {
      console.log('❌ Error:', configError.message);
    } else {
      console.log('✅ Configuración encontrada:', config.length, 'registros');
      config.forEach(c => {
        console.log(`   - ${c.service}: ${c.provider} (${c.active ? 'activo' : 'inactivo'})`);
      });
    }

    // 2. Probar acceso a plantillas
    console.log('\n2. Probando acceso a notification_templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('notification_templates')
      .select('*')
      .limit(5);
    
    if (templatesError) {
      console.log('❌ Error:', templatesError.message);
    } else {
      console.log('✅ Plantillas encontradas:', templates.length, 'registros');
      templates.forEach(t => {
        console.log(`   - ${t.name} (${t.type}/${t.channel})`);
      });
    }

    // 3. Probar acceso a preferencias
    console.log('\n3. Probando acceso a notification_preferences...');
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(5);
    
    if (preferencesError) {
      console.log('❌ Error:', preferencesError.message);
    } else {
      console.log('✅ Preferencias encontradas:', preferences.length, 'registros');
    }

    // 4. Probar acceso a log
    console.log('\n4. Probando acceso a notification_log...');
    const { data: log, error: logError } = await supabase
      .from('notification_log')
      .select('*')
      .limit(5);
    
    if (logError) {
      console.log('❌ Error:', logError.message);
    } else {
      console.log('✅ Log encontrado:', log.length, 'registros');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }

  console.log('\n🎯 Resumen:');
  console.log('- Si ves errores 403, el problema es de autenticación');
  console.log('- Si ves errores 404, las tablas no existen');
  console.log('- Si ves datos, el sistema funciona correctamente');
}

testNotifications();
