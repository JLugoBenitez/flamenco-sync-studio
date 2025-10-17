#!/bin/bash

# Script para iniciar el proxy de notificaciones
echo "🚀 INICIANDO PROXY DE NOTIFICACIONES"
echo "===================================="

# Verificar si ya está corriendo
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Proxy ya está corriendo en http://localhost:3001"
    exit 0
fi

# Iniciar el proxy
echo "📡 Iniciando proxy en puerto 3001..."
node scripts/notification-proxy.js &

# Esperar un momento
sleep 3

# Verificar que esté funcionando
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Proxy iniciado correctamente en http://localhost:3001"
    echo "📧 Email: POST /send-email"
    echo "💬 WhatsApp: POST /send-whatsapp"
    echo "📱 SMS: POST /send-sms"
else
    echo "❌ Error iniciando el proxy"
    exit 1
fi
