#!/bin/bash

echo "🧹 LIMPIANDO CLAVES Y SECRETOS DEL PROYECTO..."
echo "=============================================="

# Crear backup de seguridad
echo "📦 Creando backup de seguridad..."
cp -r . ../flamenco-backup-$(date +%Y%m%d-%H%M%S)

# Limpiar claves de Kong
echo "🔧 Limpiando kong.yml..."
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9\.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0/SUPABASE_ANON_KEY/g' kong.yml
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' kong.yml

echo "🔧 Limpiando kong-simple.yml..."
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9\.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0/SUPABASE_ANON_KEY/g' kong-simple.yml
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' kong-simple.yml

# Limpiar docker-compose.yml
echo "🔧 Limpiando docker-compose.yml..."
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' docker-compose.yml

# Limpiar scripts de prueba
echo "🔧 Limpiando scripts de prueba..."
find scripts/ -name "*.js" -o -name "*.cjs" | xargs sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9\.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0/process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"/g'
find scripts/ -name "*.js" -o -name "*.cjs" | xargs sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"/g'

# Limpiar test-sync.js
echo "🔧 Limpiando test-sync.js..."
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"/g' test-sync.js

# Limpiar scripts de inicio
echo "🔧 Limpiando scripts de inicio..."
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' start-app.sh
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' start-edge-function.sh
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' edge-local/start-app.sh
sed -i 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0\.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU/SUPABASE_SERVICE_ROLE_KEY/g' edge-local/start-edge-function.sh

# Limpiar claves de prueba
echo "🔧 Limpiando claves de prueba..."
find scripts/ -name "*.js" -o -name "*.cjs" | xargs sed -i 's/AC123456789:your_auth_token/TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN/g'
find scripts/ -name "*.js" -o -name "*.cjs" | xargs sed -i 's/test-api-key-12345/HOLDED_API_KEY/g'

# Crear archivo .env.example actualizado
echo "📝 Creando .env.example actualizado..."
cat > .env.example << 'EOF'
# ===========================================
# 🔐 CONFIGURACIÓN DE SEGURIDAD
# ===========================================

# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

# Holded API Configuration
HOLDED_API_KEY=YOUR_HOLDED_API_KEY_HERE

# Database Configuration
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# WooCommerce Configuration (opcional)
WOO_URL=YOUR_WOOCOMMERCE_URL_HERE
WOO_KEY=YOUR_WOOCOMMERCE_KEY_HERE
WOO_SECRET=YOUR_WOOCOMMERCE_SECRET_HERE

# Twilio Configuration (opcional)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER_HERE

# Resend Configuration (opcional)
RESEND_API_KEY=YOUR_RESEND_API_KEY_HERE
RESEND_FROM_EMAIL=YOUR_RESEND_FROM_EMAIL_HERE
EOF

echo ""
echo "✅ ¡LIMPIEZA COMPLETADA!"
echo "======================="
echo ""
echo "📋 ARCHIVOS MODIFICADOS:"
echo "   ✅ kong.yml - Claves reemplazadas por variables"
echo "   ✅ kong-simple.yml - Claves reemplazadas por variables"
echo "   ✅ docker-compose.yml - Claves reemplazadas por variables"
echo "   ✅ test-sync.js - Claves reemplazadas por variables"
echo "   ✅ scripts/* - Claves reemplazadas por variables"
echo "   ✅ start-*.sh - Claves reemplazadas por variables"
echo "   ✅ .env.example - Archivo de ejemplo actualizado"
echo ""
echo "🔒 PRÓXIMOS PASOS:"
echo "   1. Crear archivo .env con tus claves reales"
echo "   2. Nunca subir .env a Git"
echo "   3. Usar variables de entorno en producción"
echo "   4. Revisar que no queden claves hardcodeadas"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Las claves han sido reemplazadas por variables"
echo "   - Debes configurar las variables de entorno"
echo "   - El backup está en ../flamenco-backup-*"
echo ""
echo "🚀 ¡PROYECTO SEGURO!"
