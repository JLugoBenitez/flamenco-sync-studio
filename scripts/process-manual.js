// Procesador manual de notificaciones pendientes
import fetch from 'node-fetch';

async function processManualNotifications() {
  console.log('🔄 PROCESANDO NOTIFICACIONES PENDIENTES MANUALMENTE');
  console.log('==================================================\n');

  try {
    // Lista de notificaciones pendientes (obtenidas de la base de datos)
    const pendingNotifications = [
      {
        id: 'b549076f-a683-4203-9c13-d26ec6bf19c6',
        type: 'test',
        channel: 'sms',
        recipient: '+34627388086',
        content: 'Prueba de notificación - 17/10/2025 - Sistema funcionando correctamente. - FlamencoPuro'
      },
      {
        id: '56a85a2b-e4de-4eab-b7cd-2cc9ebb376ba',
        type: 'test',
        channel: 'email',
        recipient: 'javierlugobenitez7@gmail.com',
        subject: 'Prueba de notificación - FlamencoPuro',
        content: '<h2>🎉 ¡Prueba de notificación exitosa!</h2><p>Este es un email de prueba del sistema FlamencoPuro.</p><p><strong>Fecha:</strong> 17/10/2025</p><p>Si recibes este mensaje, el sistema de notificaciones está funcionando correctamente.</p>'
      }
    ];

    console.log(`✅ Procesando ${pendingNotifications.length} notificaciones pendientes`);

    // Procesar cada notificación
    for (const notification of pendingNotifications) {
      console.log(`\n📤 Procesando ${notification.type} → ${notification.recipient}...`);

      try {
        let success = false;
        let messageId = '';

        // Enviar según el canal
        switch (notification.channel) {
          case 'email':
            const emailResponse = await fetch('http://localhost:3002/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: notification.recipient,
                subject: notification.subject || 'Notificación FlamencoPuro',
                content: notification.content
              })
            });
            const emailData = await emailResponse.json();
            success = emailData.success;
            messageId = emailData.messageId;
            break;

          case 'whatsapp':
            const whatsappResponse = await fetch('http://localhost:3002/send-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: notification.recipient,
                content: notification.content
              })
            });
            const whatsappData = await whatsappResponse.json();
            success = whatsappData.success;
            messageId = whatsappData.messageId;
            break;

          case 'sms':
            const smsResponse = await fetch('http://localhost:3002/send-sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: notification.recipient,
                content: notification.content
              })
            });
            const smsData = await smsResponse.json();
            success = smsData.success;
            messageId = smsData.messageId;
            break;
        }

        if (success) {
          console.log(`✅ Enviado: ${messageId}`);
        } else {
          console.log(`❌ Error enviando`);
        }

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    console.log('\n🎉 ¡PROCESAMIENTO COMPLETADO!');
    console.log('==============================');
    console.log('✅ Notificaciones procesadas');
    console.log('✅ Revisa tu email y WhatsApp');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

processManualNotifications();
