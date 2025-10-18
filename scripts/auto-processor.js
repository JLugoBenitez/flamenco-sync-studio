// Procesador automático de notificaciones
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"';

const supabase = createClient(supabaseUrl, supabaseKey);

async function processNotification(notification) {
  console.log(`📤 Procesando ${notification.type} → ${notification.recipient}...`);

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

    // Actualizar estado en la base de datos
    if (success) {
      await supabase
        .from('notification_log')
        .update({
          status: 'sent',
          external_id: messageId,
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);

      console.log(`✅ Enviado: ${messageId}`);
    } else {
      await supabase
        .from('notification_log')
        .update({
          status: 'failed',
          error_message: 'Error al enviar notificación'
        })
        .eq('id', notification.id);

      console.log(`❌ Error enviando`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    await supabase
      .from('notification_log')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', notification.id);
  }
}

async function processAllPending() {
  console.log('🔄 PROCESANDO TODAS LAS NOTIFICACIONES PENDIENTES');
  console.log('================================================\n');

  try {
    // Obtener todas las notificaciones pendientes
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notification_log')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.log('❌ Error obteniendo notificaciones:', fetchError.message);
      return;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('✅ No hay notificaciones pendientes');
      return;
    }

    console.log(`✅ Encontradas ${pendingNotifications.length} notificaciones pendientes`);

    // Procesar cada notificación
    for (const notification of pendingNotifications) {
      await processNotification(notification);
      // Pequeña pausa entre notificaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 ¡TODAS LAS NOTIFICACIONES PROCESADAS!');
    console.log('=========================================');
    console.log('✅ Revisa tu email y WhatsApp');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

// Ejecutar inmediatamente
processAllPending();
