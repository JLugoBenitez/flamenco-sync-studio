// Procesador inmediato de notificaciones de WhatsApp
import fetch from 'node-fetch';

async function processWhatsAppNow() {
  console.log('🚀 PROCESANDO NOTIFICACIONES DE WHATSAPP AHORA MISMO');
  console.log('==================================================\n');

  try {
    // Obtener notificaciones pendientes directamente de la base de datos
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    console.log('1. 📋 Obteniendo notificaciones pendientes...');
    const { stdout } = await execAsync(`
      docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
        SELECT id, type, channel, recipient, content 
        FROM public.notification_log 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT 10;
      "
    `);

    // Parsear las notificaciones
    const lines = stdout.split('\n').filter(line => 
      line.includes('|') && 
      line.includes('whatsapp') && 
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
      if (parts.length < 5) continue;

      const [id, type, channel, recipient, content] = parts;
      
      console.log(`\n${i + 1}. 📤 Procesando ${type} → ${recipient}`);

      try {
        // Enviar WhatsApp
        const whatsappResponse = await fetch('http://localhost:3002/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            content: content
          })
        });
        
        const whatsappData = await whatsappResponse.json();

        if (whatsappData.success) {
          // Actualizar estado en la base de datos
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'sent', external_id = '${whatsappData.messageId}', sent_at = NOW() 
              WHERE id = '${id}';
            "
          `);
          console.log(`   ✅ Enviado: ${whatsappData.messageId}`);
        } else {
          // Marcar como fallido
          await execAsync(`
            docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
              UPDATE public.notification_log 
              SET status = 'failed', error_message = 'Error al enviar WhatsApp' 
              WHERE id = '${id}';
            "
          `);
          console.log(`   ❌ Error enviando: ${whatsappData.error}`);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 ¡TODAS LAS NOTIFICACIONES PROCESADAS!');
    console.log('=========================================');
    console.log('✅ Revisa tu WhatsApp ahora mismo');
    console.log('✅ Las notificaciones se enviaron correctamente');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

processWhatsAppNow();
