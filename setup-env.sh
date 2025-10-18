#!/bin/bash

echo "🔐 CONFIGURANDO VARIABLES DE ENTORNO..."
echo "======================================"

# Verificar si .env existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << 'EOF'
# ===========================================
# 🔐 CONFIGURACIÓN DE SEGURIDAD
# ===========================================

# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Holded API Configuration
HOLDED_API_KEY=c0ec41e6ce3f1b0ff734b63c6edfee81

# Database Configuration
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# WooCommerce Configuration (opcional)
WOO_URL=
WOO_KEY=
WOO_SECRET=

# Twilio Configuration (opcional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend Configuration (opcional)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
EOF
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

# Cargar variables de entorno
echo "🔄 Cargando variables de entorno..."
export $(cat .env | grep -v '^#' | xargs)

# Verificar que las variables estén cargadas
echo "🔍 Verificando variables de entorno..."
echo "   VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "   VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."
echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo "   HOLDED_API_KEY: ${HOLDED_API_KEY:0:10}..."

echo ""
echo "✅ ¡CONFIGURACIÓN COMPLETADA!"
echo "============================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "   1. Ejecutar: source .env"
echo "   2. O reiniciar la terminal"
echo "   3. Ejecutar: ./start-app.sh"
echo ""
echo "🔒 SEGURIDAD:"
echo "   - El archivo .env NO se sube a Git"
echo "   - Las claves están protegidas"
echo "   - Usa variables de entorno en producción"
echo ""
echo "🚀 ¡LISTO PARA USAR!"
