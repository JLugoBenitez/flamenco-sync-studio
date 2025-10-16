#!/bin/bash

# Script para configurar servicios de notificación
# Ejecutar desde la raíz del proyecto

echo "🚀 Configuración de Servicios de Notificación"
echo "=============================================="

# Función para leer input seguro
read_secure() {
    read -s -p "$1: " value
    echo
    echo "$value"
}

echo ""
echo "📧 CONFIGURACIÓN DE RESEND (EMAIL)"
echo "----------------------------------"
echo "1. Ve a https://resend.com y crea una cuenta"
echo "2. Crea un API Key en el dashboard"
echo "3. (Opcional) Configura un dominio verificado"
echo ""

read -p "¿Tienes tu API Key de Resend? (y/n): " has_resend_key

if [[ $has_resend_key == "y" || $has_resend_key == "Y" ]]; then
    resend_api_key=$(read_secure "Ingresa tu API Key de Resend (re_...)")
    read -p "Email de envío (ej: noreply@tudominio.com): " resend_from_email
    
    echo ""
    echo "📱 CONFIGURACIÓN DE TWILIO (SMS + WHATSAPP)"
    echo "--------------------------------------------"
    echo "1. Ve a https://twilio.com y crea una cuenta"
    echo "2. Obtén tu Account SID y Auth Token del dashboard"
    echo "3. Compra un número de teléfono para SMS"
    echo "4. (Opcional) Configura WhatsApp Business"
    echo ""
    
    read -p "¿Tienes tus credenciales de Twilio? (y/n): " has_twilio_creds
    
    if [[ $has_twilio_creds == "y" || $has_twilio_creds == "Y" ]]; then
        twilio_account_sid=$(read_secure "Ingresa tu Account SID (AC...)")
        twilio_auth_token=$(read_secure "Ingresa tu Auth Token")
        read -p "Número de teléfono para SMS (ej: +34612345678): " twilio_phone
        read -p "Número de WhatsApp (ej: +14155238886 para sandbox): " twilio_whatsapp
        
        echo ""
        echo "💾 CONFIGURANDO EN LA BASE DE DATOS..."
        echo "======================================"
        
        # Crear archivo SQL temporal
        cat > /tmp/notification_setup.sql << EOF
-- Configuración de Email (Resend)
INSERT INTO notification_config (service, provider, api_key, from_email, active) 
VALUES ('email', 'resend', '$resend_api_key', '$resend_from_email', true)
ON CONFLICT (service, provider) 
DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    from_email = EXCLUDED.from_email,
    updated_at = NOW();

-- Configuración de SMS (Twilio)
INSERT INTO notification_config (service, provider, api_key, api_secret, from_phone, active) 
VALUES ('sms', 'twilio', '$twilio_account_sid', '$twilio_auth_token', '$twilio_phone', true)
ON CONFLICT (service, provider) 
DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    api_secret = EXCLUDED.api_secret,
    from_phone = EXCLUDED.from_phone,
    updated_at = NOW();

-- Configuración de WhatsApp (Twilio)
INSERT INTO notification_config (service, provider, api_key, api_secret, from_whatsapp, active) 
VALUES ('whatsapp', 'twilio', '$twilio_account_sid', '$twilio_auth_token', '$twilio_whatsapp', true)
ON CONFLICT (service, provider) 
DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    api_secret = EXCLUDED.api_secret,
    from_whatsapp = EXCLUDED.from_whatsapp,
    updated_at = NOW();
EOF
        
        # Ejecutar en Docker
        echo "Ejecutando configuración en la base de datos..."
        docker cp /tmp/notification_setup.sql 9493c5c63cee_flamenco_db:/tmp/notification_setup.sql
        docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -f /tmp/notification_setup.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Configuración completada exitosamente!"
            echo ""
            echo "🎯 PRÓXIMOS PASOS:"
            echo "=================="
            echo "1. Ve a la aplicación → Configuración → Notificaciones"
            echo "2. Prueba enviando una notificación de prueba"
            echo "3. Verifica que lleguen los emails/SMS/WhatsApp"
            echo ""
            echo "📊 MONITOREO:"
            echo "============="
            echo "• Historial: SELECT * FROM notification_log ORDER BY created_at DESC LIMIT 10;"
            echo "• Configuración: SELECT * FROM notification_config;"
            echo "• Templates: SELECT * FROM notification_templates;"
        else
            echo "❌ Error en la configuración. Verifica los datos ingresados."
        fi
        
        # Limpiar archivo temporal
        rm /tmp/notification_setup.sql
        
    else
        echo "⚠️  Configuración de Twilio pendiente."
        echo "Puedes ejecutar este script nuevamente cuando tengas las credenciales."
    fi
else
    echo "⚠️  Configuración de Resend pendiente."
    echo "Puedes ejecutar este script nuevamente cuando tengas el API Key."
fi

echo ""
echo "📚 DOCUMENTACIÓN:"
echo "=================="
echo "• Resend: https://resend.com/docs"
echo "• Twilio SMS: https://www.twilio.com/docs/sms"
echo "• Twilio WhatsApp: https://www.twilio.com/docs/whatsapp"
echo "• Setup completo: ./NOTIFICACIONES-SETUP.md"
