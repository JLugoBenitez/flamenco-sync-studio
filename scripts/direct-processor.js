// Procesador directo de notificaciones (sin permisos RLS)
import fetch from 'node-fetch';

async function processDirectNotifications() {
  console.log('🔄 PROCESANDO NOTIFICACIONES DIRECTAMENTE');
  console.log('========================================\n');

  try {
    // Obtener notificaciones pendientes directamente de la base de datos
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    console.log('1. 📋 Obteniendo notificaciones pendientes...');
    const { stdout } = await execAsync(`
      docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
        SELECT id, type, channel, recipient, subject, content, status 
        FROM public.notification_log 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT 10;
      " | grep -E "^\s*[a-f0-9-]{36}"
    `);

    if (!stdout.trim()) {
      console.log('✅ No hay notificaciones pendientes');
      return;
    }

    const lines = stdout.trim().split('\n').filter(line => line.includes('|'));
    console.log(`✅ Encontradas ${lines.length} notificaciones pendientes`);

    // Procesar cada notificación
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 7) continue;

      const [id, type, channel, recipient, subject, content, status] = parts;
      
      console.log(`\n📤 Procesando ${type} → ${recipient}...`);

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

        // Actualizar estado en la base de datos
        if (success) {
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'sent', external_id = '${messageId}', sent_at = NOW() 
              WHERE id = '${id}';
            "
          `);
          console.log(`✅ Enviado: ${messageId}`);
        } else {
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'failed', error_message = 'Error al enviar notificación' 
              WHERE id = '${id}';
            "
          `);
          console.log(`❌ Error enviando`);
        }

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        
        await execAsync(`
          docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
            UPDATE public.notification_log 
            SET status = 'failed', error_message = '${error.message.replace(/'/g, "''")}' 
            WHERE id = '${id}';
          "
        `);
      }

      // Pausa entre notificaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 ¡TODAS LAS NOTIFICACIONES PROCESADAS!');
    console.log('=========================================');
    console.log('✅ Revisa tu email y WhatsApp');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

processDirectNotifications();
