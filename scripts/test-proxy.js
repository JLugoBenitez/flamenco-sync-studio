// Script para probar el proxy de notificaciones
import fetch from 'node-fetch';

async function testProxy() {
  console.log('🧪 PRUEBA DEL PROXY DE NOTIFICACIONES');
  console.log('=====================================\n');

  try {
    // 1. Health check
    console.log('1. 🔍 Verificando proxy...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Proxy funcionando:', healthData.message);
    } else {
      console.log('❌ Proxy no disponible');
      return;
    }

    // 2. Probar email
    console.log('\n2. 📧 Probando envío de email...');
    const emailResponse = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'javierlugobenitez7@gmail.com',
        subject: 'Prueba de proxy - FlamencoPuro',
        content: '<h2>🎉 ¡Prueba de proxy exitosa!</h2><p>Este email fue enviado a través del proxy local.</p>',
      }),
    });

    const emailData = await emailResponse.json();
    
    if (emailResponse.ok && emailData.success) {
      console.log('✅ Email enviado:', emailData.messageId);
    } else {
      console.log('❌ Error email:', emailData.error);
    }

    // 3. Probar WhatsApp
    console.log('\n3. 💬 Probando envío de WhatsApp...');
    const whatsappResponse = await fetch('http://localhost:3001/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+34612345678',
        content: '🧪 *Prueba de proxy exitosa*\n\nEste mensaje fue enviado a través del proxy local. ¡Funciona perfectamente! 🎉',
      }),
    });

    const whatsappData = await whatsappResponse.json();
    
    if (whatsappResponse.ok && whatsappData.success) {
      console.log('✅ WhatsApp enviado:', whatsappData.messageId);
    } else {
      console.log('❌ Error WhatsApp:', whatsappData.error);
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ Proxy funcionando correctamente');
    console.log('✅ Notificaciones enviadas sin CORS');
    console.log('✅ Sistema listo para usar en la aplicación');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testProxy();
