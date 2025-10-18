const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const CONTAINER_NAME = 'flamenco_db';

async function createTestNotifications() {
  try {
    console.log('🧪 CREANDO NOTIFICACIONES DE PRUEBA');
    console.log('===================================');
    
    const testContent = `🧪 Notificación de prueba del sistema Flamenco Sync

¡Hola! Esta es una notificación de prueba.

✅ Sistema funcionando correctamente
📅 Fecha: ${new Date().toLocaleString()}
📱 WhatsApp: +34627388086
📧 Email: javierlugobenitez7@gmail.com

¡Las notificaciones están funcionando perfectamente!`;

    // Crear notificación de WhatsApp
    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        INSERT INTO public.notification_log (type, channel, recipient, content, status)
        VALUES ('test', 'whatsapp', '+34627388086', '${testContent}', 'pending');
      "
    `);
    console.log('✅ Notificación de WhatsApp creada');

    // Crear notificación de Email
    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        INSERT INTO public.notification_log (type, channel, recipient, content, status)
        VALUES ('test', 'email', 'javierlugobenitez7@gmail.com', '${testContent}', 'pending');
      "
    `);
    console.log('✅ Notificación de Email creada');

    // Crear notificación de SMS
    await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        INSERT INTO public.notification_log (type, channel, recipient, content, status)
        VALUES ('test', 'sms', '+34627388086', '${testContent}', 'pending');
      "
    `);
    console.log('✅ Notificación de SMS creada');

    console.log('');
    console.log('📬 Notificaciones creadas exitosamente');
    console.log('⏰ El procesador las enviará en los próximos 30 segundos');
    console.log('');
    console.log('📱 Verifica tu WhatsApp: +34627388086');
    console.log('📧 Verifica tu email: javierlugobenitez7@gmail.com');
    console.log('');

  } catch (error) {
    console.error('❌ Error creando notificaciones de prueba:', error.message);
  }
}

async function checkNotificationStatus() {
  try {
    console.log('📊 ESTADO DE LAS NOTIFICACIONES');
    console.log('===============================');
    
    const { stdout } = await execAsync(`
      docker exec ${CONTAINER_NAME} psql -U postgres -d postgres -c "
        SELECT 
          channel,
          status,
          COUNT(*) as count,
          MAX(created_at) as last_created
        FROM public.notification_log 
        WHERE recipient IN ('+34627388086', 'javierlugobenitez7@gmail.com')
        GROUP BY channel, status
        ORDER BY channel, status;
      "
    `);
    
    console.log(stdout);
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error.message);
  }
}

async function main() {
  await createTestNotifications();
  await new Promise(resolve => setTimeout(resolve, 2000));
  await checkNotificationStatus();
}

main().catch(console.error);






