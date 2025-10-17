// Procesador automático que SÍ funciona
import fetch from 'node-fetch';

async function processNotifications() {
  try {
    console.log('🔄 Procesando notificaciones...');

    // Obtener notificaciones pendientes directamente
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Query para obtener notificaciones pendientes
    const query = `
      SELECT id, type, channel, recipient, content 
      FROM public.notification_log 
      WHERE status = 'pending' 
      ORDER BY created_at ASC 
      LIMIT 10;
    `;

    const { stdout } = await execAsync(`
      docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "${query}"
    `);

    // Parsear resultado
    const lines = stdout.split('\n').filter(line => 
      line.includes('|') && 
      (line.includes('whatsapp') || line.includes('email') || line.includes('sms')) && 
      !line.includes('id') && 
      !line.includes('---') &&
      !line.includes('(') &&
      line.trim().length > 0
    );

    if (lines.length === 0) {
      console.log('✅ No hay notificaciones pendientes');
      return;
    }

    console.log(`📤 Procesando ${lines.length} notificaciones...`);

    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 5) continue;

      const [id, type, channel, recipient, content] = parts;
      
      console.log(`   ${type} → ${recipient} (${channel})`);

      try {
        let success = false;
        let messageId = '';
        let errorMsg = '';

        // Enviar según el canal
        switch (channel) {
          case 'email':
            const emailResponse = await fetch('http://localhost:3002/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: recipient,
                subject: 'Notificación FlamencoPuro',
                content: content
              })
            });
            const emailData = await emailResponse.json();
            success = emailData.success;
            messageId = emailData.messageId || '';
            errorMsg = emailData.error || '';
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
            messageId = whatsappData.messageId || '';
            errorMsg = whatsappData.error || '';
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
            messageId = smsData.messageId || '';
            errorMsg = smsData.error || '';
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
          console.log(`   ✅ Enviado: ${messageId}`);
        } else {
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'failed', error_message = '${errorMsg.replace(/'/g, "''")}' 
              WHERE id = '${id}';
            "
          `);
          console.log(`   ❌ Error: ${errorMsg}`);
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        
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

    console.log('✅ Procesamiento completado\n');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 PROCESADOR AUTOMÁTICO FUNCIONANDO');
  console.log('====================================');
  console.log('⏰ Ejecutando cada 30 segundos...\n');

  // Ejecutar inmediatamente
  await processNotifications();

  // Ejecutar cada 30 segundos
  setInterval(processNotifications, 30000);
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Error no manejado:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('❌ Excepción no capturada:', error.message);
});

// Iniciar el procesador
main().catch(console.error);
