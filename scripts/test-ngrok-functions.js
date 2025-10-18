#!/usr/bin/env node

// Script para probar Edge Functions con ngrok
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://localhost:8000',
  'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"'
);

async function testNgrokFunctions() {
  console.log('🧪 PROBANDO EDGE FUNCTIONS CON NGROK');
  console.log('====================================');

  try {
    // 1. Verificar que Supabase esté corriendo
    console.log('\n1. Verificando Supabase...');
    const { data: health, error: healthError } = await supabase
      .from('configuracion')
      .select('count')
      .limit(1);

    if (healthError) throw healthError;
    console.log('✅ Supabase funcionando correctamente');

    // 2. Probar Edge Function de Holded Sync
    console.log('\n2. Probando Holded Sync Function...');
    try {
      const { data: syncData, error: syncError } = await supabase.functions.invoke('holded-sync', {
        body: { action: 'get_contacts' }
      });

      if (syncError) {
        console.log('⚠️  Holded Sync Function no disponible (normal si no está desplegada)');
        console.log(`   Error: ${syncError.message}`);
      } else {
        console.log('✅ Holded Sync Function funcionando');
        console.log(`   Contactos: ${syncData?.contacts?.length || 0}`);
      }
    } catch (error) {
      console.log('⚠️  Holded Sync Function no disponible');
      console.log(`   Error: ${error.message}`);
    }

    // 3. Probar Edge Function de WooCommerce Sync
    console.log('\n3. Probando WooCommerce Sync Function...');
    try {
      const { data: wooData, error: wooError } = await supabase.functions.invoke('woocommerce-sync', {
        body: { action: 'sync_products' }
      });

      if (wooError) {
        console.log('⚠️  WooCommerce Sync Function no disponible');
        console.log(`   Error: ${wooError.message}`);
      } else {
        console.log('✅ WooCommerce Sync Function funcionando');
        console.log(`   Productos: ${wooData?.products?.length || 0}`);
      }
    } catch (error) {
      console.log('⚠️  WooCommerce Sync Function no disponible');
      console.log(`   Error: ${error.message}`);
    }

    // 4. Probar Edge Function de Holded Webhook
    console.log('\n4. Probando Holded Webhook Function...');
    try {
      const testWebhook = {
        event: 'invoice.created',
        data: {
          id: 'test-invoice-' + Date.now(),
          customerId: 'test-customer',
          total: 99.99,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Test invoice from ngrok'
        }
      };

      const { data: webhookData, error: webhookError } = await supabase.functions.invoke('holded-webhook', {
        body: testWebhook
      });

      if (webhookError) {
        console.log('⚠️  Holded Webhook Function no disponible');
        console.log(`   Error: ${webhookError.message}`);
      } else {
        console.log('✅ Holded Webhook Function funcionando');
        console.log(`   Response: ${webhookData?.message || 'OK'}`);
      }
    } catch (error) {
      console.log('⚠️  Holded Webhook Function no disponible');
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n🎉 PRUEBA COMPLETADA');
    console.log('===================');
    console.log('\n📝 Para usar ngrok:');
    console.log('1. Ejecuta: ./scripts/start-ngrok.sh');
    console.log('2. Copia la URL HTTPS que te da ngrok');
    console.log('3. Usa esa URL para configurar webhooks en Holded');
    console.log('\n🔗 URLs de ejemplo:');
    console.log('   - Holded Webhook: https://xxxxx.ngrok.io/functions/v1/holded-webhook');
    console.log('   - Holded Sync: https://xxxxx.ngrok.io/functions/v1/holded-sync');
    console.log('   - WooCommerce Sync: https://xxxxx.ngrok.io/functions/v1/woocommerce-sync');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

testNgrokFunctions();
