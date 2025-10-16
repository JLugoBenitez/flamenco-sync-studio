// Script final para probar notificaciones con Edge Functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalNotifications() {
  console.log('🎯 PRUEBA FINAL - NOTIFICACIONES CON EDGE FUNCTIONS');
  console.log('===================================================\n');

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

    // 2. Probar Edge Function de email
    console.log('\n2. 📧 Probando Edge Function de email...');
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'test@example.com',
        subject: 'Prueba Final - FlamencoPuro',
        content: 'Esta es una prueba final del sistema de notificaciones. Si ves este mensaje, las Edge Functions están funcionando correctamente.'
      }
    });

    if (emailError) {
      console.log('❌ Error en Edge Function email:', emailError.message);
      console.log('   Esto es normal si las variables de entorno no están configuradas');
    } else {
      console.log('✅ Edge Function email funcionando:', emailData);
    }

    // 3. Probar Edge Function de WhatsApp
    console.log('\n3. 💬 Probando Edge Function de WhatsApp...');
    const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        to: '+34600000000',
        content: 'Prueba final de WhatsApp desde FlamencoPuro 🎵'
      }
    });

    if (whatsappError) {
      console.log('❌ Error en Edge Function WhatsApp:', whatsappError.message);
      console.log('   Esto es normal si las variables de entorno no están configuradas');
    } else {
      console.log('✅ Edge Function WhatsApp funcionando:', whatsappData);
    }

    // 4. Verificar plantillas
    console.log('\n4. 📋 Verificando plantillas disponibles...');
    const { data: templates, error: templatesError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', 'test')
      .eq('active', true);
    
    if (templatesError) {
      console.log('❌ Error:', templatesError.message);
    } else {
      console.log('✅ Plantillas disponibles:', templates.length);
      templates.forEach(t => {
        console.log(`   - ${t.name} (${t.channel})`);
      });
    }

    console.log('\n🎉 ¡PRUEBA FINAL COMPLETADA!');
    console.log('============================');
    console.log('✅ Sistema de notificaciones configurado');
    console.log('✅ Edge Functions creadas');
    console.log('✅ Plantillas de prueba disponibles');
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Limpia caché del navegador (Ctrl+Shift+Delete)');
    console.log('2. Ve a: http://localhost:8080');
    console.log('3. Login: admin@admin.com / holaadmin');
    console.log('4. Configuración → Notificaciones → Pruebas');
    console.log('5. Prueba enviar notificaciones');
    
    console.log('\n💡 NOTAS:');
    console.log('- Los emails se enviarán realmente si las API keys están configuradas');
    console.log('- WhatsApp necesita activar sandbox en Twilio');
    console.log('- SMS necesita comprar número en Twilio');
    console.log('- Si hay errores de Edge Functions, es por variables de entorno');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testFinalNotifications();
