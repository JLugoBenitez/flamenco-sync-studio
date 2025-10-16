#!/bin/bash
# Script para importar datos a Supabase Cloud
# Ejecutar desde el directorio del proyecto

echo "🚀 Iniciando importación a Supabase Cloud..."

# Verificar que las variables de entorno estén configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: Configura las variables de entorno:"
    echo "   export SUPABASE_URL=https://tu-proyecto.supabase.co"
    echo "   export SUPABASE_SERVICE_KEY=tu-service-role-key"
    exit 1
fi

# Lista de archivos CSV a importar
CSV_FILES=(
    "configuracion.csv"
    "profiles.csv"
    "user_roles.csv"
    "empleados.csv"
    "productos.csv"
    "clientes.csv"
    "encargos.csv"
    "fichajes.csv"
    "incidencias.csv"
    "facturas.csv"
)

echo "📤 Importando archivos CSV..."

for csv_file in "${CSV_FILES[@]}"; do
    if [ -f "backup-data/$csv_file" ]; then
        echo "  📋 Importando $csv_file..."
        # Aquí puedes agregar comandos específicos para importar a Supabase
        # Por ejemplo, usando curl o la CLI de Supabase
        echo "    ✅ $csv_file listo para importar"
    else
        echo "  ⚠️  Archivo $csv_file no encontrado"
    fi
done

echo "✅ Script de importación creado"
echo "💡 Para importar manualmente:"
echo "   1. Ve a Supabase Studio"
echo "   2. Table Editor > Import data"
echo "   3. Selecciona los archivos CSV de backup-data/"
