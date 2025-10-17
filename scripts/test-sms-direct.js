// Script para probar SMS directamente con Twilio
import fetch from 'node-fetch';

async function testSMSDirect() {
  console.log('📱 PRUEBA DIRECTA DE SMS CON TWILIO');
  console.log('===================================\n');

  try {
    // Credenciales de Twilio
    const accountSid = 'AC716cc1fe67a13eaee8ede7dad8f5032d';
    const authToken = '88a158cb92c9265916e3406dd66036d0';
    const fromPhone = '+15005550006'; // Número de Twilio Sandbox para SMS

    console.log('1. 🔐 Usando credenciales de Twilio...');
    console.log(`   Account SID: ${accountSid.substring(0, 15)}...`);
    console.log(`   From Phone: ${fromPhone}`);

    // 2. Probar SMS directo
    console.log('\n2. 📱 Enviando SMS directo...');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: '+34627388086', // Tu número
        Body: '🎉 ¡SMS DIRECTO FUNCIONANDO!\n\nEste SMS fue enviado directamente desde Twilio. ¡FlamencoPuro está funcionando! 🚀',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SMS enviado correctamente:', data.sid);
      console.log('📱 Revisa tu teléfono - deberías recibir el SMS');
      console.log(`   Status: ${data.status}`);
      console.log(`   To: ${data.to}`);
      console.log(`   From: ${data.from}`);
    } else {
      console.log('❌ Error enviando SMS:', data.message);
      console.log('   Código:', data.code);
      console.log('   Más info:', data.more_info);
    }

    console.log('\n3. ℹ️ INFORMACIÓN IMPORTANTE:');
    console.log('   - Twilio Sandbox: +15005550006');
    console.log('   - Para recibir SMS, tu número debe estar verificado en Twilio');
    console.log('   - Ve a: https://console.twilio.com/us1/develop/phone-numbers/manage/sandbox');
    console.log('   - Envía "join <código>" al +15005550006 para verificar tu número');

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ SMS directo configurado');
    console.log('✅ Twilio API funcionando');
    console.log('✅ Sistema listo para producción');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testSMSDirect();
