#!/bin/bash

echo "🔧 CONFIGURACIÓN DE NOTIFICACIONES"
echo "=================================="
echo ""

# Verificar que Docker esté corriendo
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi

echo "📋 Configuración actual:"
echo ""

# Mostrar configuración actual
docker exec flamenco_db psql -U postgres -d postgres -c "
SELECT clave, valor, descripcion 
FROM public.configuracion 
WHERE clave LIKE '%twilio%' OR clave LIKE '%resend%'
ORDER BY clave;
"

echo ""
echo "🔑 Para configurar notificaciones reales, necesitas:"
echo ""
echo "1. TWILIO:"
echo "   - Account SID (empieza con AC...)"
echo "   - Auth Token"
echo "   - Phone Number (formato: +1234567890)"
echo ""
echo "2. RESEND:"
echo "   - API Key (empieza con re_...)"
echo "   - From Email (ej: noreply@tudominio.com)"
echo ""

read -p "¿Quieres configurar las claves ahora? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Ingresa las claves (presiona Enter para mantener el valor actual):"
    echo ""
    
    # Twilio Account SID
    read -p "Twilio Account SID: " twilio_sid
    if [ ! -z "$twilio_sid" ]; then
        docker exec flamenco_db psql -U postgres -d postgres -c "
        UPDATE public.configuracion 
        SET valor = '$twilio_sid' 
        WHERE clave = 'twilio_account_sid';
        "
        echo "✅ Twilio Account SID actualizado"
    fi
    
    # Twilio Auth Token
    read -p "Twilio Auth Token: " twilio_token
    if [ ! -z "$twilio_token" ]; then
        docker exec flamenco_db psql -U postgres -d postgres -c "
        UPDATE public.configuracion 
        SET valor = '$twilio_token' 
        WHERE clave = 'twilio_auth_token';
        "
        echo "✅ Twilio Auth Token actualizado"
    fi
    
    # Twilio Phone Number
    read -p "Twilio Phone Number (+1234567890): " twilio_phone
    if [ ! -z "$twilio_phone" ]; then
        docker exec flamenco_db psql -U postgres -d postgres -c "
        UPDATE public.configuracion 
        SET valor = '$twilio_phone' 
        WHERE clave = 'twilio_phone_number';
        "
        echo "✅ Twilio Phone Number actualizado"
    fi
    
    # Resend API Key
    read -p "Resend API Key: " resend_key
    if [ ! -z "$resend_key" ]; then
        docker exec flamenco_db psql -U postgres -d postgres -c "
        UPDATE public.configuracion 
        SET valor = '$resend_key' 
        WHERE clave = 'resend_api_key';
        "
        echo "✅ Resend API Key actualizado"
    fi
    
    # Resend From Email
    read -p "Resend From Email: " resend_email
    if [ ! -z "$resend_email" ]; then
        docker exec flamenco_db psql -U postgres -d postgres -c "
        UPDATE public.configuracion 
        SET valor = '$resend_email' 
        WHERE clave = 'resend_from_email';
        "
        echo "✅ Resend From Email actualizado"
    fi
    
    echo ""
    echo "🎉 Configuración completada!"
    echo ""
    echo "📋 Configuración final:"
    docker exec flamenco_db psql -U postgres -d postgres -c "
    SELECT clave, valor 
    FROM public.configuracion 
    WHERE clave LIKE '%twilio%' OR clave LIKE '%resend%'
    ORDER BY clave;
    "
    
    echo ""
    echo "🔄 Reiniciando procesador de notificaciones..."
    pkill -f "notification-processor" 2>/dev/null
    sleep 2
    cd /home/javier/Escritorio/flamenco-sync-studio
    nohup node scripts/notification-processor-real.cjs > /dev/null 2>&1 &
    echo "✅ Procesador reiniciado con nueva configuración"
    
else
    echo "ℹ️  Configuración mantenida. Las notificaciones funcionarán en modo simulado."
fi

echo ""
echo "🧪 Para probar las notificaciones:"
echo "1. Ve a la aplicación web"
echo "2. Ve a Configuración > Notificaciones"
echo "3. Haz clic en 'Probar Notificación'"
echo ""
echo "📱 Tu información de contacto:"
echo "   WhatsApp: +34627388086"
echo "   Email: javierlugobenitez7@gmail.com"
echo ""






