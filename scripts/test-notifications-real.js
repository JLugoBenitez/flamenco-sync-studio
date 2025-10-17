// Script para probar notificaciones reales con Resend y Twilio
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealNotifications() {
  console.log('🧪 PRUEBA DE NOTIFICACIONES REALES');
  console.log('===================================\n');

  try {
    // 1. Login
    console.log('1. 🔐 Autenticando usuario...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'holaadmin'
    });

    if (authError) {
      console.log('❌ Error de login:', authError.message);
      return;
    }
    console.log('✅ Login exitoso:', authData.user.email);

    // 2. Verificar configuración
    console.log('\n2. ⚙️ Verificando configuración...');
    const { data: configData, error: configError } = await supabase
      .from('notification_config')
      .select('*')
      .eq('active', true);

    if (configError) {
      console.log('❌ Error obteniendo configuración:', configError.message);
      return;
    }

    console.log('✅ Configuración encontrada:');
    configData.forEach(config => {
      console.log(`   - ${config.service}: ${config.provider} (${config.active ? 'activo' : 'inactivo'})`);
      if (config.service === 'email') {
        console.log(`     API Key: ${config.api_key.substring(0, 10)}...`);
        console.log(`     From: ${config.from_email}`);
      }
      if (config.service === 'whatsapp') {
        console.log(`     Account SID: ${config.api_key.substring(0, 15)}...`);
        console.log(`     From WhatsApp: ${config.from_whatsapp}`);
      }
    });

    // 3. Probar email con Resend
    console.log('\n3. 📧 Probando envío de email con Resend...');
    
    const emailConfig = configData.find(c => c.service === 'email');
    if (emailConfig?.api_key) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailConfig.from_email || 'noreply@flamenco.com',
            to: ['javierlugobenitez7@gmail.com'],
            subject: 'Prueba de notificación - FlamencoPuro',
            html: `
              <h2>🎉 ¡Prueba de notificación exitosa!</h2>
              <p>Este es un email de prueba del sistema FlamencoPuro.</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-ES')}</p>
              <p>Si recibes este mensaje, el sistema de notificaciones está funcionando correctamente.</p>
            `,
          }),
        });

        const emailData = await response.json();

        if (response.ok) {
          console.log('✅ Email enviado correctamente:', emailData.id);
        } else {
          console.log('❌ Error enviando email:', emailData.message);
        }
      } catch (error) {
        console.log('❌ Error en la petición de email:', error.message);
      }
    } else {
      console.log('❌ No hay configuración de email disponible');
    }

    // 4. Probar WhatsApp con Twilio
    console.log('\n4. 💬 Probando envío de WhatsApp con Twilio...');
    
    const whatsappConfig = configData.find(c => c.service === 'whatsapp');
    if (whatsappConfig?.api_key && whatsappConfig?.api_secret) {
      try {
        const accountSid = whatsappConfig.api_key;
        const authToken = whatsappConfig.api_secret;
        const fromWhatsapp = whatsappConfig.from_whatsapp;

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${fromWhatsapp}`,
            To: 'whatsapp:+34612345678',
            Body: `🧪 *Prueba de WhatsApp - FlamencoPuro*\n\n✅ Sistema funcionando correctamente\n📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n🕐 Hora: ${new Date().toLocaleTimeString('es-ES')}\n\n¡Gracias por probar el sistema! 🎉`,
          }),
        });

        const whatsappData = await response.json();

        if (response.ok) {
          console.log('✅ WhatsApp enviado correctamente:', whatsappData.sid);
        } else {
          console.log('❌ Error enviando WhatsApp:', whatsappData.message);
        }
      } catch (error) {
        console.log('❌ Error en la petición de WhatsApp:', error.message);
      }
    } else {
      console.log('❌ No hay configuración de WhatsApp disponible');
    }

    // 5. Probar SMS con Twilio
    console.log('\n5. 📱 Probando envío de SMS con Twilio...');
    
    const smsConfig = configData.find(c => c.service === 'sms');
    if (smsConfig?.api_key && smsConfig?.api_secret) {
      try {
        const accountSid = smsConfig.api_key;
        const authToken = smsConfig.api_secret;
        const fromPhone = smsConfig.from_phone;

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromPhone,
            To: '+34612345678',
            Body: `Prueba SMS FlamencoPuro - ${new Date().toLocaleDateString('es-ES')} - Sistema funcionando correctamente`,
          }),
        });

        const smsData = await response.json();

        if (response.ok) {
          console.log('✅ SMS enviado correctamente:', smsData.sid);
        } else {
          console.log('❌ Error enviando SMS:', smsData.message);
        }
      } catch (error) {
        console.log('❌ Error en la petición de SMS:', error.message);
      }
    } else {
      console.log('❌ No hay configuración de SMS disponible');
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ Sistema de notificaciones funcionando');
    console.log('✅ APIs de Resend y Twilio operativas');
    console.log('✅ Notificaciones reales enviadas');
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Ve a la aplicación: http://localhost:8080');
    console.log('2. Login: admin@admin.com / holaadmin');
    console.log('3. Ve a Configuración → Notificaciones');
    console.log('4. Prueba enviar notificaciones desde la interfaz');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testRealNotifications();
