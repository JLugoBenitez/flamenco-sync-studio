// Script para probar notificaciones con autenticación
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedNotifications() {
  console.log('🔐 Probando sistema de notificaciones con autenticación...\n');

  try {
    // 1. Intentar login como admin
    console.log('1. Intentando login como admin@admin.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'holaadmin'
    });

    if (authError) {
      console.log('❌ Error de autenticación:', authError.message);
      return;
    }

    console.log('✅ Login exitoso:', authData.user.email);

    // 2. Probar acceso a configuración
    console.log('\n2. Probando acceso a notification_config...');
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

    // 3. Probar acceso a plantillas
    console.log('\n3. Probando acceso a notification_templates...');
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

    // 4. Probar acceso a preferencias
    console.log('\n4. Probando acceso a notification_preferences...');
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(5);
    
    if (preferencesError) {
      console.log('❌ Error:', preferencesError.message);
    } else {
      console.log('✅ Preferencias encontradas:', preferences.length, 'registros');
    }

    // 5. Probar acceso a log
    console.log('\n5. Probando acceso a notification_log...');
    const { data: log, error: logError } = await supabase
      .from('notification_log')
      .select('*')
      .limit(5);
    
    if (logError) {
      console.log('❌ Error:', logError.message);
    } else {
      console.log('✅ Log encontrado:', log.length, 'registros');
    }

    // 6. Probar crear una preferencia
    console.log('\n6. Probando crear preferencia de usuario...');
    const { data: newPref, error: newPrefError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: authData.user.id,
        notification_type: 'email',
        enabled: true
      })
      .select()
      .single();
    
    if (newPrefError) {
      console.log('❌ Error creando preferencia:', newPrefError.message);
    } else {
      console.log('✅ Preferencia creada:', newPref.id);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }

  console.log('\n🎯 Resumen:');
  console.log('- Si ves errores 403, el problema es de permisos RLS');
  console.log('- Si ves errores 404, las tablas no existen');
  console.log('- Si ves datos, el sistema funciona correctamente');
  console.log('- Si puedes crear preferencias, el sistema está completamente funcional');
}

testAuthenticatedNotifications();
