import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHoldedIntegration() {
  try {
    console.log('🧪 PROBANDO INTEGRACIÓN CON HOLDED');
    console.log('=====================================\n');

    // 1. Verificar configuración de Holded
    console.log('1. Verificando configuración de Holded...');
    const { data: config, error: configError } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['holded_api_key', 'holded_company_id']);

    if (configError) {
      console.error('❌ Error obteniendo configuración:', configError);
      return;
    }

    console.log('✅ Configuración encontrada:');
    config.forEach(item => {
      const value = item.clave === 'holded_api_key' 
        ? item.valor.substring(0, 10) + '...' 
        : item.valor;
      console.log(`   ${item.clave}: ${value}`);
    });

    // 2. Verificar facturas locales
    console.log('\n2. Verificando facturas locales...');
    const { data: facturas, error: facturasError } = await supabase
      .from('facturas')
      .select(`
        *,
        clientes(nombre, email, telefono)
      `)
      .limit(5);

    if (facturasError) {
      console.error('❌ Error obteniendo facturas:', facturasError);
      return;
    }

    console.log(`✅ ${facturas.length} facturas encontradas:`);
    facturas.forEach(factura => {
      console.log(`   - ${factura.id}: ${factura.tipo} - ${factura.total}€ (${factura.estado})`);
      if (factura.holded_id) {
        console.log(`     ✅ Sincronizada con Holded: ${factura.holded_id}`);
      } else {
        console.log(`     ⏳ Pendiente de sincronización`);
      }
    });

    // 3. Probar API de Holded (simulado)
    console.log('\n3. Probando conexión con Holded...');
    const apiKey = config.find(c => c.clave === 'holded_api_key')?.valor;
    const companyId = config.find(c => c.clave === 'holded_company_id')?.valor;

    if (apiKey && companyId) {
      try {
        // Simular llamada a Holded API
        const response = await fetch('https://api.holded.com/api/invoicing/v1/contacts', {
          headers: {
            'key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('✅ Conexión con Holded exitosa');
          const data = await response.json();
          console.log(`   Contactos en Holded: ${data.contacts?.length || 0}`);
        } else {
          console.log(`⚠️  Holded API respondió con código: ${response.status}`);
          console.log('   (Esto puede ser normal si las credenciales son de prueba)');
        }
      } catch (error) {
        console.log('⚠️  Error conectando con Holded:', error.message);
        console.log('   (Esto puede ser normal si las credenciales son de prueba)');
      }
    }

    // 4. Resumen
    console.log('\n📊 RESUMEN:');
    console.log('============');
    console.log(`✅ Configuración: ${config.length === 2 ? 'Completa' : 'Incompleta'}`);
    console.log(`✅ Facturas locales: ${facturas.length}`);
    console.log(`✅ Facturas sincronizadas: ${facturas.filter(f => f.holded_id).length}`);
    console.log(`✅ Facturas pendientes: ${facturas.filter(f => !f.holded_id).length}`);

    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Ve a la aplicación y crea una factura');
    console.log('2. La factura se sincronizará automáticamente con Holded');
    console.log('3. Usa el botón "Sincronizar Holded" para sincronizar facturas existentes');
    console.log('4. Usa el botón "Ver" para ver/editar/descargar facturas');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testHoldedIntegration();
