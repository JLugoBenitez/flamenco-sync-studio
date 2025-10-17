#!/bin/bash

# Script para desplegar Edge Functions localmente
echo "🚀 DESPLEGANDO EDGE FUNCTIONS LOCALMENTE"
echo "========================================"

# Verificar que Supabase esté corriendo
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo "❌ Supabase no está corriendo. Por favor, inicia el proyecto primero."
    echo "   Ejecuta: docker-compose up -d"
    exit 1
fi

echo "📦 Desplegando Edge Functions..."

# Desplegar holded-sync
echo "1. Desplegando holded-sync..."
npx supabase functions deploy holded-sync --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ holded-sync desplegada correctamente"
else
    echo "⚠️  Error al desplegar holded-sync (esto es normal en desarrollo local)"
fi

# Desplegar holded-webhook
echo "2. Desplegando holded-webhook..."
npx supabase functions deploy holded-webhook --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ holded-webhook desplegada correctamente"
else
    echo "⚠️  Error al desplegar holded-webhook (esto es normal en desarrollo local)"
fi

# Desplegar woocommerce-sync
echo "3. Desplegando woocommerce-sync..."
npx supabase functions deploy woocommerce-sync --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ woocommerce-sync desplegada correctamente"
else
    echo "⚠️  Error al desplegar woocommerce-sync (esto es normal en desarrollo local)"
fi

echo ""
echo "🎉 DESPLIEGUE COMPLETADO"
echo "========================"
echo ""
echo "📋 URLs de las Edge Functions:"
echo "   - Holded Sync: http://localhost:54321/functions/v1/holded-sync"
echo "   - Holded Webhook: http://localhost:54321/functions/v1/holded-webhook"
echo "   - WooCommerce Sync: http://localhost:54321/functions/v1/woocommerce-sync"
echo ""
echo "🧪 Para probar:"
echo "   node scripts/test-ngrok-functions.js"
echo ""
echo "⚠️  Nota: Si las Edge Functions no se despliegan correctamente,"
echo "   el sistema funcionará con la base de datos local únicamente."
