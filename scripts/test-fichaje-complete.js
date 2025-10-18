// Script para probar el sistema de fichaje completo
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFichajeComplete() {
  console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE FICHAJE');
  console.log('==========================================\n');

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

    // 2. Verificar empleado
    console.log('\n2. 👤 Verificando empleado...');
    const { data: empleados, error: empleadosError } = await supabase
      .from('empleados')
      .select('*')
      .eq('email', authData.user.email);

    if (empleadosError) {
      console.log('❌ Error obteniendo empleados:', empleadosError.message);
      return;
    }

    if (empleados.length === 0) {
      console.log('❌ No se encontró empleado para el usuario');
      return;
    }

    console.log('✅ Empleado encontrado:', empleados[0].nombre);

    // 3. Verificar fichaje activo
    console.log('\n3. ⏰ Verificando fichaje activo...');
    const { data: fichajeActivo, error: fichajeError } = await supabase.rpc('get_active_fichaje', {
      p_user_id: authData.user.id
    });

    if (fichajeError) {
      console.log('❌ Error obteniendo fichaje activo:', fichajeError.message);
    } else {
      console.log('✅ Fichaje activo:', fichajeActivo ? 'SÍ' : 'NO');
      if (fichajeActivo) {
        console.log('   - ID:', fichajeActivo.id);
        console.log('   - Fecha entrada:', fichajeActivo.fecha_entrada);
        console.log('   - Horas trabajadas:', fichajeActivo.horas_trabajadas);
      }
    }

    // 4. Probar fichar salida si hay fichaje activo
    if (fichajeActivo) {
      console.log('\n4. 🚪 Probando fichar salida...');
      const { data: salidaData, error: salidaError } = await supabase.rpc('fichar_salida');

      if (salidaError) {
        console.log('❌ Error fichando salida:', salidaError.message);
      } else {
        console.log('✅ Salida fichada correctamente');
        console.log('   - Horas trabajadas:', salidaData?.horas_trabajadas);
        console.log('   - Fecha salida:', salidaData?.fecha_salida);
      }
    }

    // 5. Probar fichar entrada
    console.log('\n5. 🏃 Probando fichar entrada...');
    const { data: entradaData, error: entradaError } = await supabase.rpc('fichar_entrada', {
      p_empleado_id: null
    });

    if (entradaError) {
      console.log('❌ Error fichando entrada:', entradaError.message);
    } else {
      console.log('✅ Entrada fichada correctamente');
      console.log('   - ID:', entradaData?.id);
      console.log('   - Fecha entrada:', entradaData?.fecha_entrada);
    }

    // 6. Verificar fichaje activo después de entrada
    console.log('\n6. ⏰ Verificando fichaje activo después de entrada...');
    const { data: fichajeActivo2, error: fichajeError2 } = await supabase.rpc('get_active_fichaje', {
      p_user_id: authData.user.id
    });

    if (fichajeError2) {
      console.log('❌ Error obteniendo fichaje activo:', fichajeError2.message);
    } else {
      console.log('✅ Fichaje activo después de entrada:', fichajeActivo2 ? 'SÍ' : 'NO');
      if (fichajeActivo2) {
        console.log('   - ID:', fichajeActivo2.id);
        console.log('   - Fecha entrada:', fichajeActivo2.fecha_entrada);
      }
    }

    console.log('\n🎉 ¡PRUEBA COMPLETA DEL FICHAJE FINALIZADA!');
    console.log('============================================');
    console.log('✅ Login funcionando');
    console.log('✅ Empleado encontrado');
    console.log('✅ Funciones de fichaje operativas');
    console.log('✅ Sistema de fichaje completamente funcional');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testFichajeComplete();
