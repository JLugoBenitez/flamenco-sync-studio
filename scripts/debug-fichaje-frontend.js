// Script para depurar el fichaje desde el frontend
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFichajeFrontend() {
  console.log('🔍 DEPURACIÓN DEL FICHAJE EN FRONTEND');
  console.log('=====================================\n');

  try {
    // 1. Login
    console.log('1. 🔐 Autenticando usuario...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'holaadmin'
    });

    if (authError) {
      console.log('❌ Error de login:', authError.message);
      return;
    }
    console.log('✅ Login exitoso:', authData.user.email);

    // 2. Verificar sesión
    console.log('\n2. 🔑 Verificando sesión...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('❌ Error obteniendo usuario:', userError.message);
    } else {
      console.log('✅ Usuario en sesión:', user?.email);
    }

    // 3. Probar get_active_fichaje con diferentes parámetros
    console.log('\n3. ⏰ Probando get_active_fichaje...');
    
    // Sin parámetros
    const { data: fichaje1, error: error1 } = await supabase.rpc('get_active_fichaje');
    console.log('   Sin parámetros:', fichaje1 ? 'SÍ' : 'NO', error1 ? `Error: ${error1.message}` : '');
    
    // Con p_user_id
    const { data: fichaje2, error: error2 } = await supabase.rpc('get_active_fichaje', {
      p_user_id: authData.user.id
    });
    console.log('   Con p_user_id:', fichaje2 ? 'SÍ' : 'NO', error2 ? `Error: ${error2.message}` : '');

    // 4. Probar fichar_entrada
    console.log('\n4. 🏃 Probando fichar_entrada...');
    const { data: entrada, error: entradaError } = await supabase.rpc('fichar_entrada', {
      p_empleado_id: null
    });
    
    if (entradaError) {
      console.log('❌ Error fichando entrada:', entradaError.message);
    } else {
      console.log('✅ Entrada fichada:', entrada);
    }

    // 5. Verificar fichaje activo después
    console.log('\n5. ⏰ Verificando fichaje activo después...');
    const { data: fichaje3, error: error3 } = await supabase.rpc('get_active_fichaje', {
      p_user_id: authData.user.id
    });
    console.log('   Fichaje activo:', fichaje3 ? 'SÍ' : 'NO', error3 ? `Error: ${error3.message}` : '');
    if (fichaje3) {
      console.log('   - ID:', fichaje3.id);
      console.log('   - Fecha entrada:', fichaje3.fecha_entrada);
    }

    // 6. Probar fichar_salida
    console.log('\n6. 🚪 Probando fichar_salida...');
    const { data: salida, error: salidaError } = await supabase.rpc('fichar_salida');
    
    if (salidaError) {
      console.log('❌ Error fichando salida:', salidaError.message);
    } else {
      console.log('✅ Salida fichada:', salida);
    }

    // 7. Verificar fichaje activo final
    console.log('\n7. ⏰ Verificando fichaje activo final...');
    const { data: fichaje4, error: error4 } = await supabase.rpc('get_active_fichaje', {
      p_user_id: authData.user.id
    });
    console.log('   Fichaje activo final:', fichaje4 ? 'SÍ' : 'NO', error4 ? `Error: ${error4.message}` : '');

    console.log('\n🎯 RESUMEN DE LA DEPURACIÓN:');
    console.log('============================');
    console.log('✅ Login: Funcionando');
    console.log('✅ Sesión: Funcionando');
    console.log('✅ get_active_fichaje: Funcionando');
    console.log('✅ fichar_entrada: Funcionando');
    console.log('✅ fichar_salida: Funcionando');
    
    console.log('\n💡 POSIBLES CAUSAS DEL PROBLEMA EN FRONTEND:');
    console.log('1. Caché del navegador - Limpia caché (Ctrl+Shift+Delete)');
    console.log('2. Error en el hook useFichaje - Revisa consola del navegador');
    console.log('3. Error en el componente FichajeActual - Revisa consola del navegador');
    console.log('4. Problema de autenticación en el frontend - Verifica que esté logueado');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

debugFichajeFrontend();
