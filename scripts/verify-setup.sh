#!/bin/bash

# ===========================================
# Script para verificar que todo esté funcionando
# ===========================================

set -e

echo "🔍 Verificando configuración de Flamenco Sync Studio..."

# Verificar que los contenedores estén funcionando
echo "📦 Verificando contenedores..."
docker compose ps

echo ""
echo "🌐 Verificando servicios..."

# Verificar API REST
echo "  • API REST (PostgREST):"
if curl -s http://localhost:8000/rest/v1/ > /dev/null; then
    echo "    ✅ Funcionando en http://localhost:8000/rest/v1/"
else
    echo "    ❌ No responde"
fi

# Verificar Auth
echo "  • Auth (GoTrue):"
if curl -s http://localhost:8000/auth/v1/settings > /dev/null; then
    echo "    ✅ Funcionando en http://localhost:8000/auth/v1/"
else
    echo "    ❌ No responde"
fi

# Verificar Realtime
echo "  • Realtime:"
if curl -s http://localhost:4000/health > /dev/null; then
    echo "    ✅ Funcionando en ws://localhost:4000"
else
    echo "    ❌ No responde"
fi

# Verificar PostgreSQL
echo "  • PostgreSQL:"
if docker exec flamenco_db pg_isready -U postgres > /dev/null 2>&1; then
    echo "    ✅ Funcionando en localhost:5432"
else
    echo "    ❌ No responde"
fi

echo ""
echo "🗄️ Verificando base de datos..."

# Verificar tablas
echo "  • Tablas creadas:"
TABLES=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "    📊 $TABLES tablas en el esquema public"

# Verificar datos de prueba
echo "  • Datos de prueba:"
PRODUCTOS=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM productos;" | tr -d ' ')
EMPLEADOS=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM empleados;" | tr -d ' ')
echo "    🛍️  $PRODUCTOS productos"
echo "    👥 $EMPLEADOS empleados"

echo ""
echo "🔑 Verificando autenticación..."

# Verificar usuario admin
ADMIN_EXISTS=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM auth.users WHERE email = 'admin@flamencropuro.es';" | tr -d ' ')
if [ "$ADMIN_EXISTS" = "1" ]; then
    echo "    ✅ Usuario admin creado: admin@flamencropuro.es"
else
    echo "    ❌ Usuario admin no encontrado"
fi

echo ""
echo "📋 Resumen de URLs:"
echo "  • API Gateway: http://localhost:8000"
echo "  • API REST: http://localhost:8000/rest/v1/"
echo "  • Auth: http://localhost:8000/auth/v1/"
echo "  • Realtime: ws://localhost:4000"
echo "  • PostgreSQL: localhost:5432"

echo ""
echo "🔧 Para tu aplicación React, usa estas variables:"
echo "  VITE_SUPABASE_URL=http://localhost:8000"
echo "  VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "💡 Para detener los servicios: ./scripts/stop-docker.sh"
echo "💡 Para reiniciar: ./scripts/start-docker.sh"
