#!/usr/bin/env node

// Procesador de notificaciones corregido
import fetch from 'node-fetch';

const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function processNotifications() {
  try {
    console.log('🔄 Procesando notificaciones...');

    // Obtener notificaciones pendientes usando la API REST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notification_log?status=eq.pending&channel=eq.whatsapp&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const notifications = await response.json();
    
    if (notifications.length === 0) {
      console.log('   ℹ️  No hay notificaciones pendientes');
      return;
    }

    console.log(`   📱 Procesando ${notifications.length} notificaciones...`);

    for (const notification of notifications) {
      await processNotification(notification);
    }

  } catch (error) {
    console.error('❌ Error procesando notificaciones:', error.message);
  }
}

async function processNotification(notification) {
  const { id, content, recipient } = notification;
  
  try {
    console.log(`   📤 Enviando a ${recipient}: ${content.substring(0, 50)}...`);

    // Simular envío de WhatsApp (en producción usar Twilio)
    const whatsappResponse = await fetch('https://api.twilio.com/2010-04-01/Accounts/AC123456789/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('AC123456789:your_auth_token').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: recipient,
        From: 'whatsapp:+1234567890',
        Body: content
      })
    });

    if (whatsappResponse.ok) {
      const result = await whatsappResponse.json();
      
      // Marcar como enviada
      await fetch(`${SUPABASE_URL}/rest/v1/notification_log?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'sent',
          external_id: result.sid,
          sent_at: new Date().toISOString()
        })
      });

      console.log(`   ✅ Enviado: ${result.sid}`);
    } else {
      // Marcar como fallida
      await fetch(`${SUPABASE_URL}/rest/v1/notification_log?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'failed',
          error_message: `HTTP ${whatsappResponse.status}`
        })
      });

      console.log(`   ❌ Error: HTTP ${whatsappResponse.status}`);
    }

  } catch (error) {
    console.error(`   ❌ Error enviando notificación ${id}:`, error.message);
    
    // Marcar como fallida
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notification_log?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'failed',
          error_message: error.message
        })
      });
    } catch (updateError) {
      console.error('   ❌ Error actualizando estado:', updateError.message);
    }
  }
}

// Función principal
async function main() {
  console.log('🚀 PROCESADOR DE NOTIFICACIONES CORREGIDO');
  console.log('==========================================');
  console.log('⏰ Ejecutando cada 30 segundos...');
  
  // Ejecutar inmediatamente
  await processNotifications();
  
  // Luego cada 30 segundos
  setInterval(processNotifications, 30000);
}

main().catch(console.error);

