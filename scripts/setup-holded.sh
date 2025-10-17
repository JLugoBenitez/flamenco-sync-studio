#!/bin/bash

# Script para configurar Holded API
echo "🔧 CONFIGURACIÓN DE HOLDED API"
echo "================================"

# Verificar que Docker esté corriendo
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi

# Verificar que la base de datos esté disponible
if ! docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ La base de datos no está disponible. Por favor, inicia el proyecto primero."
    exit 1
fi

echo "📋 Configuración de Holded API"
echo ""
echo "Para obtener tu API key de Holded:"
echo "1. Ve a https://www.holded.com"
echo "2. Inicia sesión en tu cuenta"
echo "3. Ve a Configuración > API"
echo "4. Copia tu API key"
echo ""

read -p "🔑 Ingresa tu API key de Holded: " HOLDED_API_KEY

if [ -z "$HOLDED_API_KEY" ]; then
    echo "❌ API key no proporcionada"
    exit 1
fi

read -p "🏢 Ingresa tu Company ID (opcional, presiona Enter para omitir): " HOLDED_COMPANY_ID

echo ""
echo "💾 Guardando configuración en la base de datos..."

# Insertar configuración en la base de datos
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
INSERT INTO public.configuracion (clave, valor) VALUES 
('holded_api_key', '$HOLDED_API_KEY'),
('holded_company_id', '$HOLDED_COMPANY_ID')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;
"

if [ $? -eq 0 ]; then
    echo "✅ Configuración guardada correctamente"
    echo ""
    echo "🧪 Probando conexión con Holded..."
    
    # Probar la conexión
    node -e "
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient('http://localhost:8000', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
    
    supabase.functions.invoke('holded-sync', {
      body: { action: 'get_contacts' }
    }).then(({ data, error }) => {
      if (error) {
        console.log('❌ Error de conexión:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Conexión exitosa con Holded');
        console.log('📊 Contactos encontrados:', data?.contacts?.length || 0);
        process.exit(0);
      }
    }).catch(err => {
      console.log('❌ Error:', err.message);
      process.exit(1);
    });
    "
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 ¡Configuración completada exitosamente!"
        echo ""
        echo "📝 Próximos pasos:"
        echo "1. Ve a la sección de Facturación en la aplicación"
        echo "2. Usa el botón 'Sincronizar Holded' para importar facturas"
        echo "3. Crea nuevas facturas que se sincronizarán automáticamente"
    else
        echo "❌ Error al probar la conexión. Verifica tu API key."
    fi
else
    echo "❌ Error al guardar la configuración"
    exit 1
fi
