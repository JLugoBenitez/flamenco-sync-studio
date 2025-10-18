import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithAuth() {
  try {
    console.log('🔍 Probando autenticación...');
    
    // Intentar autenticarse
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'holaadmin'
    });
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      return;
    }
    
    console.log('✅ Autenticación exitosa');
    console.log('👤 Usuario:', authData.user?.email);
    
    // Probar inserción con usuario autenticado
    console.log('\\n🔍 Probando inserción con usuario autenticado...');
    const testData = {
      id: 'test-auth-' + Date.now(),
      tipo: 'factura',
      total: 99.99,
      estado: 'pendiente',
      descripcion: 'Prueba con autenticación',
      holded_id: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('facturas')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Error en inserción:', insertError);
    } else {
      console.log('✅ Inserción exitosa con autenticación');
      console.log('📊 Datos insertados:', insertData);
    }
    
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

testWithAuth();
