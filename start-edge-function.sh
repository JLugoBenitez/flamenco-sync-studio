#!/bin/bash

# Script para iniciar el Edge Function de forma estable
cd edge-local

# Matar procesos anteriores
pkill -f "node index.mjs" 2>/dev/null || true
sleep 2

# Iniciar Edge Function con variables de entorno
export SUPABASE_SERVICE_ROLE_KEY="SUPABASE_SERVICE_ROLE_KEY"

echo "🚀 Iniciando Edge Function en puerto 3004..."
node index.mjs
