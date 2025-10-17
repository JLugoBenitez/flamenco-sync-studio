// Mejorar el sistema de envío de emails para evitar spam
import fetch from 'node-fetch';

async function sendImprovedEmail() {
  console.log('📧 ENVIANDO EMAIL MEJORADO');
  console.log('=========================\n');

  try {
    const response = await fetch('http://localhost:3002/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'javierlugobenitez7@gmail.com',
        subject: 'FlamencoPuro - Notificación del Sistema',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">🎭 FlamencoPuro</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestión</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-top: 0;">✅ Notificación del Sistema</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Hola <strong>Javier</strong>,
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                El sistema de notificaciones de FlamencoPuro está funcionando correctamente. 
                Este es un email de prueba para verificar que las notificaciones llegan a tu bandeja de entrada.
              </p>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">📊 Estado del Sistema</h3>
                <ul style="color: #666; margin: 0;">
                  <li>✅ Emails: Funcionando</li>
                  <li>✅ WhatsApp: Funcionando</li>
                  <li>✅ SMS: Simulado</li>
                  <li>✅ Notificaciones automáticas: Activas</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}<br>
                <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-ES')}
              </p>
            </div>
            
            <div style="background: #f1f3f4; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 0;">
                Este es un email automático del sistema FlamencoPuro.<br>
                Si no deseas recibir estas notificaciones, contacta con el administrador.
              </p>
            </div>
          </div>
        `
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Email mejorado enviado:', data.messageId);
      console.log('📧 Revisa tu bandeja de entrada (no spam)');
    } else {
      console.log('❌ Error enviando email:', data.error);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

sendImprovedEmail();
