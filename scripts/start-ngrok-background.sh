#!/bin/bash

# Script para iniciar ngrok en segundo plano
echo "🚀 INICIANDO NGROK EN SEGUNDO PLANO"
echo "==================================="

# Verificar que Supabase esté corriendo
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo "❌ Supabase no está corriendo. Por favor, inicia el proyecto primero."
    echo "   Ejecuta: docker-compose up -d"
    exit 1
fi

# Verificar si ya hay un túnel ngrok corriendo
if pgrep -f "ngrok" > /dev/null; then
    echo "⚠️  Ya hay un túnel ngrok corriendo."
    echo "   Deteniendo túnel anterior..."
    pkill -f "ngrok"
    sleep 2
fi

echo "🌐 Iniciando túnel ngrok en segundo plano..."
echo "   Puerto: 54321 (Supabase Edge Functions)"
echo "   Log: ngrok.log"
echo ""

# Crear archivo de log
touch ngrok.log

# Iniciar ngrok en segundo plano
nohup ngrok http 54321 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Guardar PID para poder detenerlo después
echo $NGROK_PID > ngrok.pid

echo "✅ Ngrok iniciado con PID: $NGROK_PID"
echo "📝 Para ver el log: tail -f ngrok.log"
echo "🛑 Para detener: ./scripts/stop-ngrok.sh"
echo ""

# Esperar un poco para que ngrok se inicie
sleep 3

# Intentar obtener la URL pública
echo "🔍 Obteniendo URL pública..."
sleep 2

# Extraer URL de ngrok del log
if [ -f ngrok.log ]; then
    NGROK_URL=$(grep -o 'https://[a-z0-9]*\.ngrok\.io' ngrok.log | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌐 URL pública: $NGROK_URL"
        echo ""
        echo "📋 URLs de las Edge Functions:"
        echo "   - Holded Webhook: $NGROK_URL/functions/v1/holded-webhook"
        echo "   - Holded Sync: $NGROK_URL/functions/v1/holded-sync"
        echo "   - WooCommerce Sync: $NGROK_URL/functions/v1/woocommerce-sync"
        echo ""
        echo "🔧 Configuración en Holded:"
        echo "   1. Ve a tu panel de Holded"
        echo "   2. Configuración > Webhooks"
        echo "   3. URL del webhook: $NGROK_URL/functions/v1/holded-webhook"
        echo "   4. Eventos: invoice.created, invoice.updated, invoice.paid"
    else
        echo "⚠️  No se pudo obtener la URL de ngrok. Revisa el log: tail -f ngrok.log"
    fi
else
    echo "⚠️  No se pudo crear el archivo de log"
fi

echo ""
echo "✅ Ngrok ejecutándose en segundo plano"
