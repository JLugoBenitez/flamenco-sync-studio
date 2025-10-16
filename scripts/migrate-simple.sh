#!/bin/bash

# ===========================================
# Script simple para migrar datos a Lovable/Supabase Cloud
# ===========================================

set -e

echo "🚀 Iniciando migración a Lovable/Supabase Cloud..."

# Verificar que Docker esté funcionando
if ! docker ps | grep -q flamenco_db; then
    echo "❌ Error: La base de datos local no está funcionando"
    echo "💡 Ejecuta: docker compose up -d"
    exit 1
fi

echo "✅ Base de datos local funcionando"

# Crear directorio de respaldo
BACKUP_DIR="./backup-data"
mkdir -p "$BACKUP_DIR"

echo "📦 Creando respaldo de datos..."

# Lista de tablas a migrar
TABLES=(
    "configuracion"
    "profiles" 
    "user_roles"
    "empleados"
    "productos"
    "clientes"
    "encargos"
    "fichajes"
    "incidencias"
    "facturas"
)

# Crear archivos CSV para cada tabla
for table in "${TABLES[@]}"; do
    echo "📤 Exportando tabla: $table"
    
    # Exportar datos a CSV
    docker exec flamenco_db psql -U postgres -d postgres -c "
    COPY (
        SELECT * FROM $table 
        ORDER BY created_at ASC
    ) TO STDOUT WITH CSV HEADER
    " > "$BACKUP_DIR/${table}.csv"
    
    # Contar registros
    if [ -f "$BACKUP_DIR/${table}.csv" ]; then
        RECORD_COUNT=$(wc -l < "$BACKUP_DIR/${table}.csv")
        if [ "$RECORD_COUNT" -gt 1 ]; then
            echo "  ✅ $table: $((RECORD_COUNT-1)) registros exportados"
        else
            echo "  ⚠️  $table: tabla vacía"
        fi
    else
        echo "  ❌ Error exportando $table"
    fi
done

echo ""
echo "📊 Resumen de exportación:"
echo "=========================="
for table in "${TABLES[@]}"; do
    if [ -f "$BACKUP_DIR/${table}.csv" ]; then
        RECORD_COUNT=$(wc -l < "$BACKUP_DIR/${table}.csv")
        if [ "$RECORD_COUNT" -gt 1 ]; then
            echo "  📋 $table: $((RECORD_COUNT-1)) registros"
        else
            echo "  📋 $table: 0 registros"
        fi
    fi
done

echo ""
echo "🎯 Próximos pasos para migrar a Lovable:"
echo "========================================"
echo ""
echo "1. 📁 Archivos CSV creados en: $BACKUP_DIR/"
echo ""
echo "2. 🌐 Ve a tu dashboard de Lovable:"
echo "   https://lovable.dev/dashboard"
echo ""
echo "3. 🔑 Obtén las credenciales de Supabase:"
echo "   - Ve a tu proyecto en Lovable"
echo "   - Settings > Environment Variables"
echo "   - Copia SUPABASE_URL y SUPABASE_ANON_KEY"
echo ""
echo "4. 📤 Importa los datos:"
echo "   - Ve a Supabase Studio desde Lovable"
echo "   - Table Editor > Import data"
echo "   - Selecciona los archivos CSV de $BACKUP_DIR/"
echo ""
echo "5. 🔄 Actualiza tu .env local:"
echo "   - Crea archivo .env con las credenciales de Lovable"
echo "   - Reinicia tu aplicación"
echo ""

# Crear archivo .env de ejemplo
cat > .env.example << EOF
# Configuración para Lovable/Supabase Cloud
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-aqui

# Para desarrollo local (opcional)
# VITE_SUPABASE_URL=http://localhost:8000
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF

echo "📝 Archivo .env.example creado con configuración de ejemplo"
echo ""
echo "✅ ¡Respaldo completado! Archivos listos para importar a Lovable."

