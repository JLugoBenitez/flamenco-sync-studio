#!/bin/bash

# Script para iniciar el Edge Function de forma estable
cd edge-local

# Matar procesos anteriores
pkill -f "node index.mjs" 2>/dev/null || true
sleep 2

# Iniciar Edge Function con variables de entorno
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

echo "🚀 Iniciando Edge Function en puerto 3004..."
node index.mjs
