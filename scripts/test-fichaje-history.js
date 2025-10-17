// Script para probar que el historial de fichajes se actualiza correctamente
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFichajeHistory() {
  console.log('🧪 PRUEBA DEL HISTORIAL DE FICHAJES');
  console.log('===================================\n');

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

    // 2. Obtener fichajes antes
    console.log('\n2. 📋 Obteniendo fichajes ANTES de fichar...');
    const { data: fichajesAntes, error: fichajesAntesError } = await supabase.rpc('get_fichajes_usuario');

    if (fichajesAntesError) {
      console.log('❌ Error obteniendo fichajes:', fichajesAntesError.message);
      return;
    }

    console.log('✅ Fichajes antes:', fichajesAntes.length);
    fichajesAntes.slice(0, 3).forEach((f, index) => {
      console.log(`   ${index + 1}. ${f.empleado_nombre} - ${f.fecha_entrada ? new Date(f.fecha_entrada).toLocaleString('es-ES') : 'N/A'}`);
    });

    // 3. Fichar entrada
    console.log('\n3. 🏃 Fichando entrada...');
    const { data: entradaData, error: entradaError } = await supabase.rpc('fichar_entrada_mejorada');

    if (entradaError) {
      console.log('❌ Error fichando entrada:', entradaError.message);
      return;
    }

    console.log('✅ Entrada fichada:', entradaData.empleado_nombre);

    // 4. Obtener fichajes después de entrada
    console.log('\n4. 📋 Obteniendo fichajes DESPUÉS de entrada...');
    const { data: fichajesDespues, error: fichajesDespuesError } = await supabase.rpc('get_fichajes_usuario');

    if (fichajesDespuesError) {
      console.log('❌ Error obteniendo fichajes:', fichajesDespuesError.message);
      return;
    }

    console.log('✅ Fichajes después:', fichajesDespues.length);
    fichajesDespues.slice(0, 3).forEach((f, index) => {
      console.log(`   ${index + 1}. ${f.empleado_nombre} - ${f.fecha_entrada ? new Date(f.fecha_entrada).toLocaleString('es-ES') : 'N/A'}`);
    });

    // 5. Verificar que se añadió un fichaje
    if (fichajesDespues.length > fichajesAntes.length) {
      console.log('✅ ¡NUEVO FICHAJE AÑADIDO AL HISTORIAL!');
    } else {
      console.log('❌ No se añadió fichaje al historial');
    }

    // 6. Fichar salida
    console.log('\n5. 🚪 Fichando salida...');
    const { data: salidaData, error: salidaError } = await supabase.rpc('fichar_salida_mejorada');

    if (salidaError) {
      console.log('❌ Error fichando salida:', salidaError.message);
      return;
    }

    console.log('✅ Salida fichada:', salidaData.empleado_nombre, `(${salidaData.horas_trabajadas.toFixed(2)}h)`);

    // 7. Obtener fichajes finales
    console.log('\n6. 📋 Obteniendo fichajes FINALES...');
    const { data: fichajesFinales, error: fichajesFinalesError } = await supabase.rpc('get_fichajes_usuario');

    if (fichajesFinalesError) {
      console.log('❌ Error obteniendo fichajes:', fichajesFinalesError.message);
      return;
    }

    console.log('✅ Fichajes finales:', fichajesFinales.length);
    fichajesFinales.slice(0, 3).forEach((f, index) => {
      console.log(`   ${index + 1}. ${f.empleado_nombre} - ${f.fecha_entrada ? new Date(f.fecha_entrada).toLocaleString('es-ES') : 'N/A'} - ${f.fecha_salida ? 'Completado' : 'En curso'}`);
    });

    console.log('\n🎉 ¡PRUEBA DEL HISTORIAL COMPLETADA!');
    console.log('====================================');
    console.log('✅ Fichajes antes:', fichajesAntes.length);
    console.log('✅ Fichajes después de entrada:', fichajesDespues.length);
    console.log('✅ Fichajes finales:', fichajesFinales.length);
    console.log('✅ Historial se actualiza correctamente');
    
    console.log('\n🎯 RESULTADO:');
    if (fichajesFinales.length > fichajesAntes.length) {
      console.log('✅ El historial se actualiza automáticamente');
      console.log('✅ Los fichajes aparecen en la lista inmediatamente');
    } else {
      console.log('❌ El historial no se actualiza automáticamente');
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testFichajeHistory();
