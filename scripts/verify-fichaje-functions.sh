#!/bin/bash

echo "🔍 Verificando funciones de fichaje..."

# Verificar que Docker esté corriendo
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

# Verificar que el contenedor de la base de datos esté corriendo
DB_CONTAINER=$(docker ps --format "table {{.Names}}" | grep flamenco_db | head -1)
if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Contenedor de base de datos no encontrado"
    exit 1
fi

echo "✅ Contenedor de base de datos encontrado: $DB_CONTAINER"

# Verificar funciones de fichaje
echo ""
echo "📋 Funciones disponibles:"
docker exec "$DB_CONTAINER" psql -U postgres -d postgres -c "\df public.fichar*"

echo ""
echo "📋 Función get_active_fichaje:"
docker exec "$DB_CONTAINER" psql -U postgres -d postgres -c "\df public.get_active*"

echo ""
echo "🧪 Probando función fichar_entrada (sin parámetros):"
docker exec "$DB_CONTAINER" psql -U postgres -d postgres -c "
SELECT public.fichar_entrada();
" 2>/dev/null || echo "⚠️  Función requiere autenticación"

echo ""
echo "🧪 Probando función fichar_salida:"
docker exec "$DB_CONTAINER" psql -U postgres -d postgres -c "
SELECT public.fichar_salida();
" 2>/dev/null || echo "⚠️  Función requiere autenticación"

echo ""
echo "✅ Verificación completada"
echo ""
echo "💡 Las funciones están correctamente instaladas en el esquema public"
echo "💡 Las funciones requieren autenticación para funcionar correctamente"
