#!/bin/bash

# ===========================================
# Script para migrar datos a Supabase Cloud
# ===========================================

set -e

echo "🚀 Iniciando migración a Supabase Cloud..."

# Verificar que las variables de entorno estén configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: Necesitas configurar las variables de entorno:"
    echo "   export SUPABASE_URL=https://tu-proyecto.supabase.co"
    echo "   export SUPABASE_SERVICE_KEY=tu-service-role-key"
    echo ""
    echo "💡 Puedes obtener estas credenciales desde tu dashboard de Supabase:"
    echo "   https://supabase.com/dashboard/project/tu-proyecto/settings/api"
    exit 1
fi

echo "✅ Variables de entorno configuradas"
echo "   URL: $SUPABASE_URL"
echo "   Service Key: ${SUPABASE_SERVICE_KEY:0:20}..."

# Crear archivo temporal para el backup
BACKUP_FILE="/tmp/flamenco_backup.sql"
echo "📦 Creando backup de la base de datos local..."

# Crear backup completo de la base de datos
docker exec flamenco_db pg_dump -U postgres -d postgres \
    --data-only \
    --inserts \
    --column-inserts \
    --exclude-table=schema_migrations \
    > "$BACKUP_FILE"

echo "✅ Backup creado en $BACKUP_FILE"

# Función para ejecutar SQL en Supabase
execute_supabase_sql() {
    local sql="$1"
    local table="$2"
    
    echo "  📤 Migrando tabla: $table"
    
    # Usar curl para ejecutar SQL en Supabase
    response=$(curl -s -X POST \
        "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$sql\"}" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "    ✅ $table migrada correctamente"
    else
        echo "    ❌ Error migrando $table"
        echo "    Response: $response"
    fi
}

# Migrar datos tabla por tabla
echo "🔄 Iniciando migración de datos..."

# 1. Migrar empleados
echo "👥 Migrando empleados..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, nombre, email, telefono, rol, activo, created_at
    FROM empleados
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/empleados.csv

# 2. Migrar productos
echo "🛍️ Migrando productos..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, nombre, talla, precio, stock, categoria, descripcion, imagen_url, created_at, updated_at
    FROM productos
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/productos.csv

# 3. Migrar clientes
echo "👤 Migrando clientes..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, nombre, email, telefono, direccion, cif_nif, created_at
    FROM clientes
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/clientes.csv

# 4. Migrar encargos
echo "📦 Migrando encargos..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, cliente_id, producto_descripcion, precio_total, estado, fecha_pedido, fecha_entrega, notas, created_at, updated_at
    FROM encargos
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/encargos.csv

# 5. Migrar fichajes
echo "⏰ Migrando fichajes..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, empleado_id, fecha, hora_entrada, hora_salida, horas_trabajadas, created_at, user_id
    FROM fichajes
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/fichajes.csv

# 6. Migrar incidencias
echo "🚨 Migrando incidencias..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, titulo, descripcion, asignado_id, prioridad, estado, fecha_creacion, fecha_resolucion, creado_por
    FROM incidencias
    ORDER BY fecha_creacion
) TO STDOUT WITH CSV HEADER
" > /tmp/incidencias.csv

# 7. Migrar facturas
echo "💰 Migrando facturas..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, cliente_id, tipo, fecha, fecha_vencimiento, total, estado, created_at
    FROM facturas
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/facturas.csv

# 8. Migrar profiles
echo "👤 Migrando profiles..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, user_id, nombre, email, telefono, created_at, updated_at
    FROM profiles
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/profiles.csv

# 9. Migrar user_roles
echo "🔐 Migrando user_roles..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, user_id, role, created_at
    FROM user_roles
    ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > /tmp/user_roles.csv

# 10. Migrar configuracion
echo "⚙️ Migrando configuracion..."
docker exec flamenco_db psql -U postgres -d postgres -c "
COPY (
    SELECT id, clave, valor, updated_at
    FROM configuracion
    ORDER BY clave
) TO STDOUT WITH CSV HEADER
" > /tmp/configuracion.csv

echo "✅ Archivos CSV creados para migración"

# Mostrar resumen de datos
echo ""
echo "📊 Resumen de datos a migrar:"
echo "  👥 Empleados: $(wc -l < /tmp/empleados.csv) registros"
echo "  🛍️ Productos: $(wc -l < /tmp/productos.csv) registros"
echo "  👤 Clientes: $(wc -l < /tmp/clientes.csv) registros"
echo "  📦 Encargos: $(wc -l < /tmp/encargos.csv) registros"
echo "  ⏰ Fichajes: $(wc -l < /tmp/fichajes.csv) registros"
echo "  🚨 Incidencias: $(wc -l < /tmp/incidencias.csv) registros"
echo "  💰 Facturas: $(wc -l < /tmp/facturas.csv) registros"
echo "  👤 Profiles: $(wc -l < /tmp/profiles.csv) registros"
echo "  🔐 User Roles: $(wc -l < /tmp/user_roles.csv) registros"
echo "  ⚙️ Configuración: $(wc -l < /tmp/configuracion.csv) registros"

echo ""
echo "🎯 Próximos pasos:"
echo "1. Asegúrate de que tu proyecto Supabase Cloud tenga las mismas tablas"
echo "2. Ejecuta las migraciones en Supabase Cloud"
echo "3. Usa los archivos CSV para importar los datos"
echo ""
echo "📁 Archivos CSV creados en /tmp/:"
echo "  - empleados.csv"
echo "  - productos.csv"
echo "  - clientes.csv"
echo "  - encargos.csv"
echo "  - fichajes.csv"
echo "  - incidencias.csv"
echo "  - facturas.csv"
echo "  - profiles.csv"
echo "  - user_roles.csv"
echo "  - configuracion.csv"

echo ""
echo "✅ Migración preparada. Archivos listos para importar a Supabase Cloud."

