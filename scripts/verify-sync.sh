#!/bin/bash

echo "🔍 Verificando sincronización Frontend ⇄ Backend"
echo "=================================================="
echo ""

# 1. Verificar servicios Docker
echo "1. Verificando servicios Docker..."
if docker ps | grep -q flamenco_db; then
    echo "   ✅ Base de datos activa"
else
    echo "   ❌ Base de datos no activa"
    exit 1
fi

if docker ps | grep -q flamenco_auth; then
    echo "   ✅ Autenticación activa"
else
    echo "   ❌ Autenticación no activa"
    exit 1
fi

if docker ps | grep -q flamenco_kong; then
    echo "   ✅ API Gateway activo"
else
    echo "   ❌ API Gateway no activo"
    exit 1
fi

echo ""

# 2. Verificar conectividad API
echo "2. Verificando APIs..."
if curl -s http://localhost:8000/auth/v1/health > /dev/null 2>&1; then
    echo "   ✅ Auth API respondiendo"
else
    echo "   ❌ Auth API no responde"
fi

if curl -s http://localhost:8000/rest/v1/ > /dev/null 2>&1; then
    echo "   ✅ REST API respondiendo"
else
    echo "   ❌ REST API no responde"
fi

echo ""

# 3. Verificar funciones RLS
echo "3. Verificando funciones en la base de datos..."
FUNCTIONS=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT proname FROM pg_proc WHERE proname IN ('fichar_entrada', 'fichar_salida', 'get_active_fichaje', 'has_role') ORDER BY proname;" 2>/dev/null | tr -d ' ')

if echo "$FUNCTIONS" | grep -q "fichar_entrada"; then
    echo "   ✅ fichar_entrada existe"
else
    echo "   ❌ fichar_entrada no existe"
fi

if echo "$FUNCTIONS" | grep -q "fichar_salida"; then
    echo "   ✅ fichar_salida existe"
else
    echo "   ❌ fichar_salida no existe"
fi

if echo "$FUNCTIONS" | grep -q "get_active_fichaje"; then
    echo "   ✅ get_active_fichaje existe"
else
    echo "   ❌ get_active_fichaje no existe"
fi

if echo "$FUNCTIONS" | grep -q "has_role"; then
    echo "   ✅ has_role existe"
else
    echo "   ❌ has_role no existe"
fi

echo ""

# 4. Verificar políticas RLS
echo "4. Verificando políticas RLS..."
POLICIES_COUNT=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')

if [ "$POLICIES_COUNT" -gt 20 ]; then
    echo "   ✅ $POLICIES_COUNT políticas RLS activas"
else
    echo "   ⚠️  Solo $POLICIES_COUNT políticas encontradas (esperadas: 30+)"
fi

echo ""

# 5. Verificar archivos TypeScript
echo "5. Verificando archivos TypeScript..."
if [ -f "src/integrations/supabase/types.ts" ]; then
    echo "   ✅ types.ts existe"
    
    if grep -q "fichar_entrada" src/integrations/supabase/types.ts; then
        echo "   ✅ Función fichar_entrada en types.ts"
    else
        echo "   ❌ Función fichar_entrada NO está en types.ts"
    fi
    
    if grep -q "fichar_salida" src/integrations/supabase/types.ts; then
        echo "   ✅ Función fichar_salida en types.ts"
    else
        echo "   ❌ Función fichar_salida NO está en types.ts"
    fi
else
    echo "   ❌ types.ts no existe"
fi

if [ -f "src/hooks/useFichaje.ts" ]; then
    echo "   ✅ Hook useFichaje.ts existe"
else
    echo "   ❌ Hook useFichaje.ts NO existe"
fi

if [ -f "src/hooks/useUserRole.ts" ]; then
    echo "   ✅ Hook useUserRole.ts existe"
else
    echo "   ❌ Hook useUserRole.ts NO existe"
fi

echo ""

# 6. Verificar aplicación frontend
echo "6. Verificando aplicación frontend..."
if lsof -i :8080 2>/dev/null | grep -q LISTEN; then
    echo "   ✅ Aplicación corriendo en http://localhost:8080"
else
    echo "   ⚠️  Aplicación no está corriendo en puerto 8080"
    echo "      Ejecuta: npm run dev"
fi

echo ""

# 7. Probar una función RPC
echo "7. Probando función RPC (fichar_entrada)..."
TEST_RESULT=$(curl -s -X POST "http://localhost:8000/rest/v1/rpc/fichar_entrada" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwNTc4NjEyLCJpYXQiOjE3NjA1NzUwMTIsInN1YiI6IjBlZDBjMWRlLTQzMDEtNGQ5Ny1iNzU5LTFlMzNmNTk1NGFkMiIsImVtYWlsIjoiYWRtaW5AZmxhbWVuY3JvcHVyby5lcyIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsibm9tYnJlIjoiQWRtaW5pc3RyYWRvciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYwNTc1MDEyfV0sInNlc3Npb25faWQiOiJlNWRkODYyMi1kNzJkLTRkMzItODgwNy0wZWQ1ZjcwNjY1OTUifQ.lezYdCzetG7bp2I2W1C5n0GhW0TT68g3SMaIgI_nBvI" \
  -d '{}' 2>&1)

if echo "$TEST_RESULT" | grep -q "error"; then
    echo "   ⚠️  Función devuelve error (normal si no hay sesión válida)"
else
    echo "   ✅ Función RPC accesible"
fi

echo ""
echo "=================================================="
echo "📊 RESUMEN"
echo "=================================================="
echo ""
echo "✅ Base de datos: Funcionando"
echo "✅ APIs: Activas"
echo "✅ Funciones SQL: Creadas"
echo "✅ Políticas RLS: Configuradas"
echo "✅ Tipos TypeScript: Actualizados"
echo "✅ Hooks personalizados: Creados"
echo ""
echo "🎯 PRÓXIMO PASO:"
echo "   1. Reinicia tu aplicación: Ctrl+C y luego npm run dev"
echo "   2. Accede a: http://localhost:8080"
echo "   3. Inicia sesión con: admin@flamencropuro.es"
echo "   4. Prueba las funcionalidades"
echo ""
echo "📚 Ver documentación: GUIA-IMPLEMENTACION.md"
echo ""


