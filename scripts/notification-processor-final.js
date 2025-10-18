#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log('🚀 PROCESADOR DE NOTIFICACIONES FINAL');
console.log('=====================================');

// Configuración
const CONTAINER_NAME = 'flamenco_db';
const PROCESS_INTERVAL = 30000; // 30 segundos
const MAX_RETRIES = 3;

// Función para ejecutar comandos SQL
async function executeSQL(query) {
  try {
    const { stdout } = await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -t -c "${query}"
    `);
    return stdout.trim();
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message);
    throw error;
  }
}

// Función para obtener notificaciones pendientes
async function getPendingNotifications() {
  try {
    const result = await executeSQL(`
      SELECT id, type, channel, recipient, content 
      FROM public.notification_log 
      WHERE status = 'pending' 
      AND channel = 'whatsapp'
      ORDER BY created_at ASC 
      LIMIT 3;
    `);
    
    if (!result || result.trim() === '') {
      return [];
    }
    
    return result.split('\n').map(line => {
      const [id, type, channel, recipient, content] = line.split('|').map(s => s.trim());
      return { id, type, channel, recipient, content };
    }).filter(notif => notif.id);
  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error.message);
    return [];
  }
}

// Función para enviar notificación WhatsApp (simulada)
async function sendWhatsAppNotification(notification) {
  try {
    console.log(`📱 Enviando WhatsApp a ${notification.recipient}: ${notification.content}`);
    
    // Simular envío exitoso
    const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Marcar como enviada
    await executeSQL(`
      UPDATE public.notification_log 
      SET status = 'sent', external_id = '${messageId}', sent_at = NOW() 
      WHERE id = '${notification.id}';
    `);
    
    console.log(`✅ WhatsApp enviado exitosamente: ${messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando WhatsApp:`, error.message);
    
    // Marcar como fallida
    try {
      await executeSQL(`
        UPDATE public.notification_log 
        SET status = 'failed', error_message = '${error.message.replace(/'/g, "''")}', sent_at = NOW() 
        WHERE id = '${notification.id}';
      `);
    } catch (updateError) {
      console.error('❌ Error actualizando estado de notificación:', updateError.message);
    }
    
    return false;
  }
}

// Función para enviar notificación email (simulada)
async function sendEmailNotification(notification) {
  try {
    console.log(`📧 Enviando email a ${notification.recipient}: ${notification.content}`);
    
    // Simular envío exitoso
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Marcar como enviada
    await executeSQL(`
      UPDATE public.notification_log 
      SET status = 'sent', external_id = '${messageId}', sent_at = NOW() 
      WHERE id = '${notification.id}';
    `);
    
    console.log(`✅ Email enviado exitosamente: ${messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando email:`, error.message);
    
    // Marcar como fallida
    try {
      await executeSQL(`
        UPDATE public.notification_log 
        SET status = 'failed', error_message = '${error.message.replace(/'/g, "''")}', sent_at = NOW() 
        WHERE id = '${notification.id}';
      `);
    } catch (updateError) {
      console.error('❌ Error actualizando estado de notificación:', updateError.message);
    }
    
    return false;
  }
}

// Función principal de procesamiento
async function processNotifications() {
  try {
    console.log('🔄 Procesando notificaciones...');
    
    const notifications = await getPendingNotifications();
    
    if (notifications.length === 0) {
      console.log('ℹ️  No hay notificaciones pendientes');
      return;
    }
    
    console.log(`📋 Encontradas ${notifications.length} notificaciones pendientes`);
    
    for (const notification of notifications) {
      console.log(`\n📨 Procesando notificación ${notification.id} (${notification.type})`);
      
      let success = false;
      
      switch (notification.channel) {
        case 'whatsapp':
          success = await sendWhatsAppNotification(notification);
          break;
        case 'email':
          success = await sendEmailNotification(notification);
          break;
        default:
          console.log(`⚠️  Canal no soportado: ${notification.channel}`);
          // Marcar como fallida
          await executeSQL(`
            UPDATE public.notification_log 
            SET status = 'failed', error_message = 'Canal no soportado: ${notification.channel}', sent_at = NOW() 
            WHERE id = '${notification.id}';
          `);
      }
      
      if (success) {
        console.log(`✅ Notificación ${notification.id} procesada exitosamente`);
      } else {
        console.log(`❌ Error procesando notificación ${notification.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error procesando notificaciones:', error.message);
  }
}

// Función para verificar el estado del sistema
async function checkSystemStatus() {
  try {
    console.log('🔍 Verificando estado del sistema...');
    
    // Verificar que el contenedor esté corriendo
    const { stdout } = await execAsync(`docker ps --filter name=${CONTAINER_NAME} --format "{{.Status}}"`);
    if (!stdout.includes('Up')) {
      throw new Error(`Contenedor ${CONTAINER_NAME} no está corriendo`);
    }
    
    // Verificar que la tabla existe
    const tableCheck = await executeSQL(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_name = 'notification_log' AND table_schema = 'public';
    `);
    
    if (tableCheck !== '1') {
      throw new Error('Tabla notification_log no existe');
    }
    
    console.log('✅ Sistema verificado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error verificando sistema:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log(`⏰ Ejecutando cada ${PROCESS_INTERVAL / 1000} segundos...`);
  
  // Verificar estado inicial
  const systemOk = await checkSystemStatus();
  if (!systemOk) {
    console.error('❌ Sistema no está listo. Saliendo...');
    process.exit(1);
  }
  
  // Procesar inmediatamente
  await processNotifications();
  
  // Configurar intervalo
  setInterval(async () => {
    await processNotifications();
  }, PROCESS_INTERVAL);
  
  console.log('🚀 Procesador iniciado correctamente');
}

// Manejo de señales para cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo procesador de notificaciones...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo procesador de notificaciones...');
  process.exit(0);
});

// Iniciar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});



