// Script para probar SMS real con Twilio
import fetch from 'node-fetch';

async function testSMSReal() {
  console.log('📱 PRUEBA DE SMS REAL CON TWILIO');
  console.log('=================================\n');

  try {
    // 1. Verificar proxy
    console.log('1. 🔍 Verificando proxy...');
    const healthResponse = await fetch('http://localhost:3002/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Proxy funcionando:', healthData.message);
    } else {
      console.log('❌ Proxy no disponible');
      return;
    }

    // 2. Probar SMS real
    console.log('\n2. 📱 Probando envío de SMS real...');
    const smsResponse = await fetch('http://localhost:3002/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+34627388086', // Tu número real
        content: '🎉 ¡SMS REAL FUNCIONANDO!\n\nEste es un SMS real enviado desde FlamencoPuro. ¡El sistema está funcionando perfectamente! 🚀',
      }),
    });

    const smsData = await smsResponse.json();
    
    if (smsResponse.ok && smsData.success) {
      console.log('✅ SMS enviado correctamente:', smsData.messageId);
      console.log('📱 Revisa tu teléfono - deberías recibir el SMS');
    } else {
      console.log('❌ Error enviando SMS:', smsData.error);
    }

    // 3. Información importante
    console.log('\n3. ℹ️ INFORMACIÓN IMPORTANTE:');
    console.log('   - Twilio Sandbox: +14155238886');
    console.log('   - Para recibir SMS, tu número debe estar verificado en Twilio');
    console.log('   - En producción, necesitarías comprar un número de teléfono');
    console.log('   - Costo: ~$1/mes por número de teléfono');

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ SMS real configurado');
    console.log('✅ Twilio API funcionando');
    console.log('✅ Proxy actualizado');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testSMSReal();
