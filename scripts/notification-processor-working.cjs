const { exec } = require('child_process');
const { promisify } = require('util');
const fetch = require('node-fetch');

const execAsync = promisify(exec);

// Configuración
const CONTAINER_NAME = 'flamenco_db';
const PROCESSING_INTERVAL = 30000; // 30 segundos

console.log('🚀 PROCESADOR DE NOTIFICACIONES FUNCIONAL');
console.log('==========================================');
console.log(`⏰ Ejecutando cada ${PROCESSING_INTERVAL/1000} segundos...`);

async function processNotifications() {
  try {
    console.log('🔄 Procesando notificaciones...');
    
    // Obtener notificaciones pendientes
    const { stdout } = await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -t -c "
        SELECT id, type, channel, recipient, content 
        FROM public.notification_log 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT 5;
      "
    `);

    if (!stdout.trim()) {
      console.log('📭 No hay notificaciones pendientes');
      return;
    }

    const notifications = stdout.trim().split('\n').filter(line => line.trim()).map(line => {
      const [id, type, channel, recipient, content] = line.split('|').map(field => field.trim());
      return { id, type, channel, recipient, content };
    });

    console.log(`📬 Encontradas ${notifications.length} notificaciones pendientes`);

    for (const notification of notifications) {
      await processNotification(notification);
    }

  } catch (error) {
    console.error('❌ Error procesando notificaciones:', error.message);
  }
}

async function processNotification(notification) {
  const { id, type, channel, recipient, content } = notification;
  
  try {
    console.log(`📤 Procesando notificación ${id} (${type} - ${channel})`);
    
    let success = false;
    let externalId = null;
    let errorMessage = null;

    switch (channel) {
      case 'whatsapp':
        const whatsappResult = await sendWhatsApp(recipient, content);
        success = whatsappResult.success;
        externalId = whatsappResult.messageId;
        errorMessage = whatsappResult.error;
        break;
        
      case 'email':
        const emailResult = await sendEmail(recipient, content);
        success = emailResult.success;
        externalId = emailResult.messageId;
        errorMessage = emailResult.error;
        break;
        
      case 'sms':
        const smsResult = await sendSMS(recipient, content);
        success = smsResult.success;
        externalId = smsResult.messageId;
        errorMessage = smsResult.error;
        break;
        
      default:
        console.log(`⚠️  Canal no soportado: ${channel}`);
        success = false;
        errorMessage = `Canal no soportado: ${channel}`;
    }

    // Actualizar estado en la base de datos
    if (success) {
      await execAsync(`
        docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
          UPDATE public.notification_log 
          SET status = 'sent', external_id = '${externalId || 'simulated'}', sent_at = NOW() 
          WHERE id = '${id}';
        "
      `);
      console.log(`✅ Notificación ${id} enviada exitosamente`);
    } else {
      await execAsync(`
        docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
          UPDATE public.notification_log 
          SET status = 'failed', error_message = '${errorMessage || 'Error desconocido'}', sent_at = NOW() 
          WHERE id = '${id}';
        "
      `);
      console.log(`❌ Error enviando notificación ${id}: ${errorMessage}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando notificación ${id}:`, error.message);
    
    // Marcar como fallida
    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        UPDATE public.notification_log 
        SET status = 'failed', error_message = '${error.message}', sent_at = NOW() 
        WHERE id = '${id}';
      "
    `);
  }
}

async function sendWhatsApp(phone, message) {
  try {
    console.log(`💬 Enviando WhatsApp a ${phone}: ${message.substring(0, 50)}...`);
    
    // Simular envío exitoso por ahora
    // En producción, aquí iría la integración real con Twilio
    const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ WhatsApp simulado enviado (ID: ${messageId})`);
    return {
      success: true,
      messageId: messageId
    };
    
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendEmail(email, message) {
  try {
    console.log(`📧 Enviando email a ${email}: ${message.substring(0, 50)}...`);
    
    // Simular envío exitoso por ahora
    // En producción, aquí iría la integración real con Resend
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ Email simulado enviado (ID: ${messageId})`);
    return {
      success: true,
      messageId: messageId
    };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendSMS(phone, message) {
  try {
    console.log(`📱 Enviando SMS a ${phone}: ${message.substring(0, 50)}...`);
    
    // Simular envío exitoso por ahora
    // En producción, aquí iría la integración real con Twilio
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ SMS simulado enviado (ID: ${messageId})`);
    return {
      success: true,
      messageId: messageId
    };
    
  } catch (error) {
    console.error('❌ Error enviando SMS:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para crear una notificación de prueba
async function createTestNotification() {
  try {
    console.log('🧪 Creando notificación de prueba...');
    
    const testContent = `🧪 Notificación de prueba - ${new Date().toLocaleString()}`;
    
    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        INSERT INTO public.notification_log (type, channel, recipient, content, status)
        VALUES ('test', 'whatsapp', '+34627388086', '${testContent}', 'pending');
      "
    `);
    
    console.log('✅ Notificación de prueba creada');
    
  } catch (error) {
    console.error('❌ Error creando notificación de prueba:', error.message);
  }
}

// Crear notificación de prueba al inicio
createTestNotification();

// Procesar notificaciones cada 30 segundos
setInterval(processNotifications, PROCESSING_INTERVAL);

// Procesar inmediatamente al inicio
processNotifications();






