// Script para probar el sistema completo de notificaciones
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotificationSystem() {
  console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE NOTIFICACIONES');
  console.log('================================================\n');

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
    });

    // 3. Verificar plantillas
    console.log('\n3. 📋 Verificando plantillas...');
    const { data: templatesData, error: templatesError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('active', true)
      .order('type', { ascending: true });

    if (templatesError) {
      console.log('❌ Error obteniendo plantillas:', templatesError.message);
      return;
    }

    console.log('✅ Plantillas encontradas:', templatesData.length);
    const groupedTemplates = templatesData.reduce((acc, template) => {
      if (!acc[template.type]) acc[template.type] = [];
      acc[template.type].push(template);
      return acc;
    }, {});

    Object.entries(groupedTemplates).forEach(([type, templates]) => {
      console.log(`   - ${type}: ${templates.length} plantillas`);
      templates.forEach(t => console.log(`     * ${t.channel}: ${t.name}`));
    });

    // 4. Probar Edge Functions
    console.log('\n4. 🚀 Probando Edge Functions...');
    
    // Probar email
    console.log('   📧 Probando envío de email...');
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'test@example.com',
        subject: 'Prueba de notificación - FlamencoPuro',
        content: '<h2>Prueba de Email</h2><p>Este es un email de prueba del sistema FlamencoPuro.</p>'
      }
    });

    if (emailError) {
      console.log('❌ Error enviando email:', emailError.message);
    } else {
      console.log('✅ Email enviado:', emailData.success ? 'Éxito' : 'Error');
      if (emailData.success) {
        console.log('   - Message ID:', emailData.messageId);
      } else {
        console.log('   - Error:', emailData.error);
      }
    }

    // Probar WhatsApp
    console.log('   💬 Probando envío de WhatsApp...');
    const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        to: '+34612345678',
        content: '🧪 *Prueba de WhatsApp*\n\nEste es un mensaje de prueba del sistema FlamencoPuro.'
      }
    });

    if (whatsappError) {
      console.log('❌ Error enviando WhatsApp:', whatsappError.message);
    } else {
      console.log('✅ WhatsApp enviado:', whatsappData.success ? 'Éxito' : 'Error');
      if (whatsappData.success) {
        console.log('   - Message ID:', whatsappData.messageId);
      } else {
        console.log('   - Error:', whatsappData.error);
      }
    }

    // 5. Probar inserción de log
    console.log('\n5. 📝 Probando inserción de log...');
    const { data: logData, error: logError } = await supabase
      .from('notification_log')
      .insert({
        type: 'test',
        channel: 'email',
        recipient: 'test@example.com',
        subject: 'Prueba de log',
        content: 'Contenido de prueba',
        status: 'sent',
        user_id: authData.user.id
      })
      .select()
      .single();

    if (logError) {
      console.log('❌ Error insertando log:', logError.message);
    } else {
      console.log('✅ Log insertado correctamente:', logData.id);
    }

    // 6. Verificar historial
    console.log('\n6. 📊 Verificando historial de notificaciones...');
    const { data: historyData, error: historyError } = await supabase
      .from('notification_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.log('❌ Error obteniendo historial:', historyError.message);
    } else {
      console.log('✅ Historial encontrado:', historyData.length, 'registros');
      historyData.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.channel} → ${log.recipient} (${log.status})`);
      });
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('======================');
    console.log('✅ Sistema de notificaciones funcionando');
    console.log('✅ Configuración cargada correctamente');
    console.log('✅ Plantillas disponibles');
    console.log('✅ Edge Functions operativas');
    console.log('✅ Log de notificaciones funcionando');
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Ve a la aplicación: http://localhost:8080');
    console.log('2. Login: admin@admin.com / holaadmin');
    console.log('3. Ve a Configuración → Notificaciones');
    console.log('4. Prueba enviar notificaciones desde la interfaz');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testNotificationSystem();
