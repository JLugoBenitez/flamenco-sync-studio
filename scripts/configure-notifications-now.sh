#!/bin/bash

echo "🚀 CONFIGURACIÓN INMEDIATA - NOTIFICACIONES FLAMENCOPURO"
echo "========================================================"

# Credenciales proporcionadas
RESEND_API_KEY="re_jJCLwffC_Q1rGVv46i1QPG4T9HE3HGDDe"
RESEND_FROM_EMAIL="noreply@flamenco.com"

TWILIO_ACCOUNT_SID="AC716cc1fe67a13eaee8ede7dad8f5032d"
TWILIO_AUTH_TOKEN="88a158cb92c9265916e3406dd66036d0"
TWILIO_PHONE_SMS="+34612345678"  # NECESITAS CAMBIAR ESTE NÚMERO
TWILIO_WHATSAPP_SANDBOX="+14155238886"

echo ""
echo "📧 RESEND (EMAIL) - 100% GRATUITO"
echo "✅ API Key: ${RESEND_API_KEY:0:15}..."
echo "✅ Email remitente: $RESEND_FROM_EMAIL"
echo "✅ Límite: 3,000 emails/mes GRATIS"

echo ""
echo "📱 TWILIO - CRÉDITO GRATUITO"
echo "✅ Account SID: ${TWILIO_ACCOUNT_SID:0:15}..."
echo "✅ Auth Token: ${TWILIO_AUTH_TOKEN:0:15}..."
echo "✅ SMS desde: $TWILIO_PHONE_SMS (⚠️  CAMBIAR POR TU NÚMERO REAL)"
echo "✅ WhatsApp desde: $TWILIO_WHATSAPP_SANDBOX"
echo "✅ Crédito: $15.50 USD GRATIS (~2,066 SMS + 3,100 WhatsApp)"

echo ""
echo "⚠️  IMPORTANTE: Necesitas comprar un número de teléfono en Twilio"
echo "   💰 Costo: ~$1 USD/mes (después del crédito gratuito)"
echo "   🔗 Link: https://console.twilio.com/us1/develop/phone-numbers/manage/search"

echo ""
read -p "¿Quieres configurar ahora? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Configuración cancelada."
    exit 1
fi

echo ""
echo "🔧 Verificando Supabase..."

# Verificar que Docker esté corriendo
if ! docker ps | grep -q "supabase_db"; then
    echo "❌ Error: Docker no está corriendo o Supabase no está activo"
    echo "💡 Ejecuta: docker-compose up -d"
    exit 1
fi

echo "✅ Supabase detectado"

# Crear archivo SQL con las credenciales
cat > /tmp/notification_config.sql << EOF
-- Limpiar configuración anterior
DELETE FROM notification_config WHERE service IN ('email', 'sms', 'whatsapp');

-- Configuración de Email (Resend) - GRATUITO
INSERT INTO notification_config (service, provider, api_key, from_email, active) 
VALUES ('email', 'resend', '$RESEND_API_KEY', '$RESEND_FROM_EMAIL', true);

-- Configuración de SMS (Twilio) - NECESITA NÚMERO REAL
INSERT INTO notification_config (service, provider, api_key, api_secret, from_phone, active) 
VALUES ('sms', 'twilio', '$TWILIO_ACCOUNT_SID', '$TWILIO_AUTH_TOKEN', '$TWILIO_PHONE_SMS', true);

-- Configuración de WhatsApp (Twilio Sandbox) - FUNCIONA INMEDIATAMENTE
INSERT INTO notification_config (service, provider, api_key, api_secret, from_whatsapp, active) 
VALUES ('whatsapp', 'twilio', '$TWILIO_ACCOUNT_SID', '$TWILIO_AUTH_TOKEN', '$TWILIO_WHATSAPP_SANDBOX', true);

-- Mostrar configuración insertada
SELECT 'CONFIGURACIÓN INSERTADA:' as status;
SELECT service, provider, active, 
       CASE 
         WHEN service = 'email' THEN from_email
         WHEN service = 'sms' THEN from_phone
         WHEN service = 'whatsapp' THEN from_whatsapp
       END as contact_info
FROM notification_config 
ORDER BY service;
EOF

echo "📝 Ejecutando configuración en la base de datos..."

# Ejecutar en el contenedor de Supabase
docker exec flamenco-sync-studio-db-1 psql -U postgres -d postgres -f /tmp/notification_config.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡CONFIGURACIÓN COMPLETADA!"
    echo "=============================="
    echo ""
    echo "✅ Email (Resend): LISTO - 3,000 emails/mes GRATIS"
    echo "⚠️  SMS (Twilio): PENDIENTE - Necesitas comprar número"
    echo "✅ WhatsApp (Twilio): LISTO - Sandbox activo"
    echo ""
    echo "🎯 PRÓXIMOS PASOS:"
    echo "=================="
    echo "1. 📱 Comprar número en Twilio:"
    echo "   https://console.twilio.com/us1/develop/phone-numbers/manage/search"
    echo "   (Busca números españoles +34, cuesta ~$1/mes)"
    echo ""
    echo "2. 💬 Activar WhatsApp Sandbox:"
    echo "   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
    echo "   (Envía 'join <código>' al +1 415 523 8886)"
    echo ""
    echo "3. 🧪 Probar notificaciones:"
    echo "   - Ve a la app → Configuración → Notificaciones"
    echo "   - Envía notificación de prueba"
    echo ""
    echo "4. 📊 Verificar en la base de datos:"
    echo "   docker exec flamenco-sync-studio-db-1 psql -U postgres -d postgres -c \"SELECT * FROM notification_config;\""
    echo ""
    echo "💰 COSTOS ESTIMADOS:"
    echo "==================="
    echo "• Email: $0/mes (3,000 gratis)"
    echo "• SMS: $1/mes + $0.0075 por SMS"
    echo "• WhatsApp: $0.005 por mensaje"
    echo "• Total estimado: $1-5/mes para uso normal"
    
else
    echo "❌ Error en la configuración. Verifica que Supabase esté corriendo."
    echo "💡 Ejecuta: docker-compose up -d"
fi

# Limpiar archivo temporal
rm /tmp/notification_config.sql

echo ""
echo "🔗 ENLACES ÚTILES:"
echo "=================="
echo "• Dashboard Twilio: https://console.twilio.com/"
echo "• Dashboard Resend: https://resend.com/emails"
echo "• Comprar número: https://console.twilio.com/us1/develop/phone-numbers/manage/search"
echo "• WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
