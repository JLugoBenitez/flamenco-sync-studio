// Procesador automático simple que SÍ funciona
import fetch from 'node-fetch';

async function processNotifications() {
  try {
    console.log('🔄 Procesando notificaciones...');

    // Obtener notificaciones pendientes directamente con una query más simple
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Query más simple
    const { stdout } = await execAsync(`
      docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -t -c "
        SELECT id, type, channel, recipient, content 
        FROM public.notification_log 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT 5;
      "
    `);

    // Parsear resultado - cada línea es una notificación
    const lines = stdout.split('\n').filter(line => 
      line.trim().length > 0 && 
      line.includes('|') &&
      !line.includes('id')
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

        // Solo procesar WhatsApp por ahora
        if (channel === 'whatsapp') {
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
          console.log(`   ❌ Error enviando`);
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }

      // Pausa entre notificaciones
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✅ Procesamiento completado\n');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 PROCESADOR AUTOMÁTICO SIMPLE');
  console.log('================================');
  console.log('⏰ Ejecutando cada 30 segundos...\n');

  // Ejecutar inmediatamente
  await processNotifications();

  // Ejecutar cada 30 segundos
  setInterval(processNotifications, 30000);
}

// Iniciar el procesador
main().catch(console.error);
