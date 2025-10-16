// Script simple para probar inserción de preferencias
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertPreferences() {
  console.log('🧪 Probando inserción de preferencias...\n');

  try {
    // 1. Login
    console.log('1. Haciendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'holaadmin'
    });

    if (authError) {
      console.log('❌ Error de login:', authError.message);
      return;
    }

    console.log('✅ Login exitoso:', authData.user.email);

    // 2. Intentar insertar preferencia
    console.log('\n2. Intentando insertar preferencia...');
    const { data: newPref, error: insertError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: authData.user.id,
        notification_type: 'email',
        enabled: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Error insertando:', insertError);
      console.log('Código:', insertError.code);
      console.log('Mensaje:', insertError.message);
      console.log('Detalles:', insertError.details);
      console.log('Hint:', insertError.hint);
    } else {
      console.log('✅ Preferencia insertada:', newPref);
    }

    // 3. Verificar que se insertó
    console.log('\n3. Verificando preferencias...');
    const { data: preferences, error: selectError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', authData.user.id);
    
    if (selectError) {
      console.log('❌ Error seleccionando:', selectError.message);
    } else {
      console.log('✅ Preferencias encontradas:', preferences.length);
      preferences.forEach(p => {
        console.log(`   - ${p.notification_type}: ${p.enabled ? 'habilitado' : 'deshabilitado'}`);
      });
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testInsertPreferences();
