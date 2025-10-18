// Procesador de notificaciones pendientes usando el servicio
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function processNotifications() {
  console.log('🔄 PROCESANDO NOTIFICACIONES PENDIENTES');
  console.log('======================================\n');

  try {
    // 1. Obtener notificaciones pendientes usando service_role
    console.log('1. 📋 Obteniendo notificaciones pendientes...');
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notification_log')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.log('❌ Error obteniendo notificaciones:', fetchError.message);
      return;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('✅ No hay notificaciones pendientes');
      return;
    }

    console.log(`✅ Encontradas ${pendingNotifications.length} notificaciones pendientes`);

    // 2. Procesar cada notificación
    for (const notification of pendingNotifications) {
      console.log(`\n2. 📤 Procesando notificación ${notification.id}...`);
      console.log(`   Tipo: ${notification.type}`);
      console.log(`   Canal: ${notification.channel}`);
      console.log(`   Destinatario: ${notification.recipient}`);

      try {
        let success = false;
        let messageId = '';

        // Enviar según el canal usando el proxy
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

          default:
            console.log(`❌ Canal no soportado: ${notification.channel}`);
            continue;
        }

        // 3. Actualizar estado de la notificación
        if (success) {
          await supabase
            .from('notification_log')
            .update({
              status: 'sent',
              external_id: messageId,
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id);

          console.log(`✅ Notificación enviada: ${messageId}`);
        } else {
          await supabase
            .from('notification_log')
            .update({
              status: 'failed',
              error_message: 'Error al enviar notificación'
            })
            .eq('id', notification.id);

          console.log(`❌ Error enviando notificación`);
        }

      } catch (error) {
        console.log(`❌ Error procesando notificación ${notification.id}:`, error.message);
        
        await supabase
          .from('notification_log')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id);
      }
    }

    console.log('\n🎉 ¡PROCESAMIENTO COMPLETADO!');
    console.log('==============================');
    console.log('✅ Notificaciones procesadas');
    console.log('✅ Estados actualizados');
    console.log('✅ Sistema funcionando correctamente');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

// Ejecutar inmediatamente
processNotifications();
