#!/bin/bash

# Script para configurar ngrok
echo "🔧 CONFIGURACIÓN DE NGROK"
echo "========================="

echo "Para usar ngrok necesitas:"
echo "1. Crear una cuenta gratuita en https://ngrok.com"
echo "2. Obtener tu authtoken desde https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""

read -p "🔑 Ingresa tu ngrok authtoken: " NGROK_TOKEN

if [ -z "$NGROK_TOKEN" ]; then
    echo "❌ Authtoken no proporcionado"
    exit 1
fi

echo "Configurando ngrok con authtoken..."
ngrok config add-authtoken $NGROK_TOKEN

if [ $? -eq 0 ]; then
    echo "✅ Authtoken configurado correctamente"
    echo ""
    echo "🎯 Ahora puedes usar:"
    echo "   ./scripts/start-ngrok.sh - Para iniciar ngrok"
    echo "   ./scripts/start-ngrok-background.sh - Para iniciar en segundo plano"
    echo "   ./scripts/stop-ngrok.sh - Para detener ngrok"
else
    echo "❌ Error al configurar authtoken"
    exit 1
fi
