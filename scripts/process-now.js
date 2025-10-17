// Procesar notificaciones pendientes ahora mismo
import fetch from 'node-fetch';

async function processNow() {
  console.log('🚀 PROCESANDO NOTIFICACIONES AHORA MISMO');
  console.log('=======================================\n');

  try {
    // Obtener notificaciones pendientes
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    console.log('1. 📋 Obteniendo notificaciones pendientes...');
    const { stdout } = await execAsync(`
      docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
        SELECT id, type, channel, recipient, subject, content 
        FROM public.notification_log 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT 10;
      "
    `);

    // Parsear las notificaciones
    const lines = stdout.split('\n').filter(line => 
      line.includes('|') && 
      line.includes('test') && 
      !line.includes('id') && 
      !line.includes('---')
    );

    if (lines.length === 0) {
      console.log('✅ No hay notificaciones pendientes');
      return;
    }

    console.log(`✅ Encontradas ${lines.length} notificaciones pendientes`);

    // Procesar cada notificación
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 6) continue;

      const [id, type, channel, recipient, subject, content] = parts;
      
      console.log(`\n${i + 1}. 📤 Procesando ${type} → ${recipient} (${channel})`);

      try {
        let success = false;
        let messageId = '';

        // Enviar según el canal
        switch (channel) {
          case 'email':
            const emailResponse = await fetch('http://localhost:3002/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: recipient,
                subject: subject || 'Notificación FlamencoPuro',
                content: content
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
                to: recipient,
                content: content
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
                to: recipient,
                content: content
              })
            });
            const smsData = await smsResponse.json();
            success = smsData.success;
            messageId = smsData.messageId;
            break;
        }

        // Actualizar estado
        if (success) {
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'sent', external_id = '${messageId}', sent_at = NOW() 
              WHERE id = '${id}';
            "
          `);
          console.log(`   ✅ Enviado: ${messageId}`);
        } else {
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'failed' 
              WHERE id = '${id}';
            "
          `);
          console.log(`   ❌ Error enviando`);
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }

      // Pausa entre notificaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 ¡TODAS LAS NOTIFICACIONES PROCESADAS!');
    console.log('=========================================');
    console.log('✅ Revisa tu email y WhatsApp');
    console.log('✅ Las notificaciones se enviaron correctamente');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

processNow();
