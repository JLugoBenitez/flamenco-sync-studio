const { exec } = require('child_process');
const { promisify } = require('util');
const twilio = require('twilio');
const { Resend } = require('resend');

const execAsync = promisify(exec);

// Configuración
const CONTAINER_NAME = 'flamenco_db';
const PROCESSING_INTERVAL = 30000; // 30 segundos

console.log('🚀 PROCESADOR DE NOTIFICACIONES CORREGIDO');
console.log('==========================================');
console.log(`⏰ Ejecutando cada ${PROCESSING_INTERVAL/1000} segundos...`);

// Inicializar clientes de servicios
let twilioClient = null;
let resendClient = null;

async function initializeServices() {
  try {
    // Obtener configuración de la base de datos
    const { stdout } = await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -t -c "
        SELECT clave, valor FROM public.configuracion 
        WHERE clave IN ('twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'resend_api_key', 'resend_from_email')
        ORDER BY clave;
      "
    `);

    const config = {};
    stdout.trim().split('\n').forEach(line => {
      const [clave, valor] = line.split('|').map(field => field.trim());
      if (clave && valor) {
        config[clave] = valor;
      }
    });

    // Inicializar Twilio si está configurado
    if (config.twilio_account_sid && config.twilio_auth_token) {
      twilioClient = twilio(config.twilio_account_sid, config.twilio_auth_token);
      console.log('✅ Twilio inicializado');
    } else {
      console.log('⚠️  Twilio no configurado - usando modo simulado');
    }

    // Inicializar Resend si está configurado
    if (config.resend_api_key) {
      resendClient = new Resend(config.resend_api_key);
      console.log('✅ Resend inicializado');
    } else {
      console.log('⚠️  Resend no configurado - usando modo simulado');
    }

  } catch (error) {
    console.error('❌ Error inicializando servicios:', error.message);
  }
}

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
  
  // Validar que tenemos todos los campos necesarios
  if (!id || !channel || !recipient) {
    console.log(`⚠️  Notificación inválida: ${JSON.stringify(notification)}`);
    return;
  }
  
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

    // Actualizar estado en la base de datos usando un archivo temporal para evitar problemas de escape
    const updateQuery = `
      UPDATE public.notification_log 
      SET status = '${success ? 'sent' : 'failed'}', 
          external_id = '${externalId || 'simulated'}', 
          sent_at = NOW(),
          error_message = ${errorMessage ? `'${errorMessage.replace(/'/g, "''")}'` : 'NULL'}
      WHERE id = '${id}';
    `;

    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "${updateQuery}"
    `);

    if (success) {
      console.log(`✅ Notificación ${id} enviada exitosamente`);
    } else {
      console.log(`❌ Error enviando notificación ${id}: ${errorMessage}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando notificación ${id}:`, error.message);
    
    // Marcar como fallida usando un archivo temporal
    try {
      const errorQuery = `
        UPDATE public.notification_log 
        SET status = 'failed', 
            error_message = '${error.message.replace(/'/g, "''")}', 
            sent_at = NOW() 
        WHERE id = '${id}';
      `;
      
      await execAsync(`
        docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "${errorQuery}"
      `);
    } catch (updateError) {
      console.error(`❌ Error actualizando estado de notificación ${id}:`, updateError.message);
    }
  }
}

async function sendWhatsApp(phone, message) {
  try {
    console.log(`💬 Enviando WhatsApp a ${phone}: ${message.substring(0, 50)}...`);
    
    if (twilioClient) {
      // Envío real con Twilio
      const result = await twilioClient.messages.create({
        body: message,
        from: 'whatsapp:+14155238886', // Número de Twilio Sandbox
        to: `whatsapp:${phone}`
      });
      
      console.log(`✅ WhatsApp enviado (ID: ${result.sid})`);
      return {
        success: true,
        messageId: result.sid
      };
    } else {
      // Modo simulado
      const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`✅ WhatsApp simulado enviado (ID: ${messageId})`);
      return {
        success: true,
        messageId: messageId
      };
    }
    
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
    
    if (resendClient) {
      // Envío real con Resend
      const result = await resendClient.emails.send({
        from: 'Flamenco Sync <noreply@flamenco-sync.com>',
        to: [email],
        subject: 'Notificación del Sistema',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">🔔 Notificación del Sistema</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Este es un mensaje automático del sistema Flamenco Sync.
          </p>
        </div>`
      });
      
      console.log(`✅ Email enviado (ID: ${result.data?.id || 'unknown'})`);
      return {
        success: true,
        messageId: result.data?.id || 'unknown'
      };
    } else {
      // Modo simulado
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`✅ Email simulado enviado (ID: ${messageId})`);
      return {
        success: true,
        messageId: messageId
      };
    }
    
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
    
    if (twilioClient) {
      // Envío real con Twilio
      const result = await twilioClient.messages.create({
        body: message,
        from: '+1234567890', // Número de Twilio
        to: phone
      });
      
      console.log(`✅ SMS enviado (ID: ${result.sid})`);
      return {
        success: true,
        messageId: result.sid
      };
    } else {
      // Modo simulado
      const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`✅ SMS simulado enviado (ID: ${messageId})`);
      return {
        success: true,
        messageId: messageId
      };
    }
    
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
    
    const testContent = `🧪 Notificación de prueba del sistema Flamenco Sync

¡Hola! Esta es una notificación de prueba.

✅ Sistema funcionando correctamente
📅 Fecha: ${new Date().toLocaleString()}
📱 WhatsApp: +34627388086
📧 Email: javierlugobenitez7@gmail.com

¡Las notificaciones están funcionando perfectamente!`;

    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        INSERT INTO public.notification_log (type, channel, recipient, content, status)
        VALUES ('test', 'whatsapp', '+34627388086', '${testContent.replace(/'/g, "''")}', 'pending');
      "
    `);
    
    console.log('✅ Notificación de prueba creada');
    
  } catch (error) {
    console.error('❌ Error creando notificación de prueba:', error.message);
  }
}

// Inicializar servicios y crear notificación de prueba
async function start() {
  await initializeServices();
  await createTestNotification();
  
  // Procesar notificaciones cada 30 segundos
  setInterval(processNotifications, PROCESSING_INTERVAL);
  
  // Procesar inmediatamente al inicio
  await processNotifications();
}

start().catch(console.error);

