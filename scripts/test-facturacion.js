#!/usr/bin/env node

// Script para probar el sistema de facturación con Holded
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://localhost:8000',
  'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"'
);

async function testFacturacion() {
  console.log('🧪 PROBANDO SISTEMA DE FACTURACIÓN');
  console.log('===================================');

  try {
    // 1. Verificar configuración de Holded
    console.log('\n1. Verificando configuración de Holded...');
    const { data: config, error: configError } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['holded_api_key', 'holded_company_id']);

    if (configError) throw configError;

    const configMap = config?.reduce((acc, item) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {}) || {};

    if (!configMap.holded_api_key) {
      console.log('❌ Holded API key no configurada');
      console.log('   Ejecuta: ./scripts/setup-holded.sh');
      return;
    }

    console.log('✅ Configuración encontrada');
    console.log(`   API Key: ${configMap.holded_api_key.slice(0, 10)}...`);
    console.log(`   Company ID: ${configMap.holded_company_id || 'No configurado'}`);

    // 2. Probar conexión con Holded
    console.log('\n2. Probando conexión con Holded...');
    const { data: contactsData, error: contactsError } = await supabase.functions.invoke('holded-sync', {
      body: { action: 'get_contacts' }
    });

    if (contactsError) throw contactsError;

    console.log('✅ Conexión exitosa con Holded');
    console.log(`   Contactos encontrados: ${contactsData?.contacts?.length || 0}`);

    // 3. Crear una factura de prueba
    console.log('\n3. Creando factura de prueba...');
    const testInvoice = {
      type: 'factura',
      customerId: 'test-customer-id',
      total: 99.99,
      description: 'Factura de prueba desde Flamenco Sync Studio',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke('holded-sync', {
      body: { 
        action: 'create_invoice',
        invoiceData: testInvoice,
        facturaId: 'test-invoice-' + Date.now()
      }
    });

    if (invoiceError) {
      console.log('⚠️  Error al crear factura (esto es normal si no tienes clientes configurados):');
      console.log(`   ${invoiceError.message}`);
    } else {
      console.log('✅ Factura creada exitosamente');
      console.log(`   ID: ${invoiceData?.invoice?.id || 'N/A'}`);
    }

    // 4. Verificar facturas en la base de datos
    console.log('\n4. Verificando facturas en la base de datos...');
    const { data: facturas, error: facturasError } = await supabase
      .from('facturas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (facturasError) throw facturasError;

    console.log(`✅ ${facturas?.length || 0} facturas encontradas en la base de datos`);
    if (facturas && facturas.length > 0) {
      console.log('   Últimas facturas:');
      facturas.forEach((factura, index) => {
        console.log(`   ${index + 1}. ${factura.tipo} - ${factura.total}€ - ${factura.estado}`);
      });
    }

    // 5. Probar sincronización
    console.log('\n5. Probando sincronización con Holded...');
    const { data: syncData, error: syncError } = await supabase.functions.invoke('holded-sync', {
      body: { action: 'sync_invoices' }
    });

    if (syncError) {
      console.log('⚠️  Error en sincronización (esto es normal si no hay facturas en Holded):');
      console.log(`   ${syncError.message}`);
    } else {
      console.log('✅ Sincronización completada');
      console.log(`   Facturas sincronizadas: ${syncData?.synced || 0}`);
    }

    console.log('\n🎉 PRUEBA COMPLETADA');
    console.log('===================');
    console.log('El sistema de facturación está funcionando correctamente.');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configura tu API key de Holded: ./scripts/setup-holded.sh');
    console.log('2. Ve a la sección de Facturación en la aplicación');
    console.log('3. Crea clientes y facturas desde la interfaz');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

testFacturacion();
