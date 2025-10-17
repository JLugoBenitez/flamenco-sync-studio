#!/bin/bash

# Script para configurar ngrok con Supabase
echo "🌐 CONFIGURACIÓN DE NGROK CON SUPABASE"
echo "======================================"

# Verificar que Docker esté corriendo
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi

# Verificar que Supabase esté corriendo
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo "❌ Supabase no está corriendo. Por favor, inicia el proyecto primero."
    exit 1
fi

echo "📋 Configuración de ngrok"
echo ""
echo "Para usar ngrok necesitas:"
echo "1. Crear una cuenta gratuita en https://ngrok.com"
echo "2. Obtener tu authtoken desde https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""

read -p "🔑 Ingresa tu ngrok authtoken (o presiona Enter para usar sin autenticación): " NGROK_TOKEN

if [ ! -z "$NGROK_TOKEN" ]; then
    echo "Configurando ngrok con authtoken..."
    ngrok config add-authtoken $NGROK_TOKEN
    echo "✅ Authtoken configurado"
else
    echo "⚠️  Usando ngrok sin autenticación (limitado a 1 túnel simultáneo)"
fi

echo ""
echo "🚀 Iniciando túnel ngrok para Supabase Edge Functions..."
echo "   Puerto: 54321 (Supabase Edge Functions)"
echo "   URL pública: https://xxxxx.ngrok.io"
echo ""

# Crear archivo de configuración de ngrok
cat > ngrok.yml << EOF
version: "2"
authtoken: $NGROK_TOKEN
tunnels:
  supabase:
    proto: http
    addr: 54321
    schemes: [https]
    inspect: true
    bind_tls: true
EOF

echo "📝 Archivo de configuración creado: ngrok.yml"
echo ""
echo "🎯 Para iniciar el túnel, ejecuta:"
echo "   ngrok start supabase"
echo ""
echo "📋 URLs que necesitarás:"
echo "   - Edge Functions: https://xxxxx.ngrok.io/functions/v1/"
echo "   - Holded Webhook: https://xxxxx.ngrok.io/functions/v1/holded-sync"
echo "   - WooCommerce Webhook: https://xxxxx.ngrok.io/functions/v1/woocommerce-sync"
echo ""
echo "🔧 Configuración en Holded:"
echo "   1. Ve a tu panel de Holded"
echo "   2. Configuración > Webhooks"
echo "   3. URL del webhook: https://xxxxx.ngrok.io/functions/v1/holded-sync"
echo "   4. Eventos: invoice.created, invoice.updated, invoice.paid"
echo ""
echo "✅ Configuración completada"
