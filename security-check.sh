#!/bin/bash

# ===========================================
# 🔒 SCRIPT DE VERIFICACIÓN DE SEGURIDAD
# ===========================================

echo "🔍 Verificando seguridad del proyecto Flamenco Sync Studio..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
ISSUES=0

# Función para reportar problemas
report_issue() {
    echo -e "${RED}❌ PROBLEMA: $1${NC}"
    ISSUES=$((ISSUES + 1))
}

# Función para reportar advertencias
report_warning() {
    echo -e "${YELLOW}⚠️  ADVERTENCIA: $1${NC}"
}

# Función para reportar éxito
report_success() {
    echo -e "${GREEN}✅ OK: $1${NC}"
}

echo ""
echo "1. 🔐 Verificando archivos sensibles..."

# Verificar que .env no esté en el repositorio
if git ls-files | grep -q "\.env$"; then
    report_issue "Archivo .env está en el repositorio"
else
    report_success "Archivo .env no está en el repositorio"
fi

# Verificar que no haya claves hardcodeadas en el código
echo ""
echo "2. 🔑 Verificando claves hardcodeadas..."

# Buscar posibles claves API en el código
if grep -r "sk-[a-zA-Z0-9]" src/ --exclude-dir=node_modules 2>/dev/null; then
    report_issue "Posibles claves API hardcodeadas encontradas"
else
    report_success "No se encontraron claves API hardcodeadas"
fi

# Buscar tokens JWT hardcodeados
if grep -r "eyJ[A-Za-z0-9]" src/ --exclude-dir=node_modules 2>/dev/null; then
    report_warning "Posibles tokens JWT hardcodeados encontrados"
else
    report_success "No se encontraron tokens JWT hardcodeados"
fi

# Buscar contraseñas hardcodeadas
if grep -r "password.*=.*['\"][^'\"]{8,}['\"]" src/ --exclude-dir=node_modules 2>/dev/null; then
    report_issue "Posibles contraseñas hardcodeadas encontradas"
else
    report_success "No se encontraron contraseñas hardcodeadas"
fi

echo ""
echo "3. 📁 Verificando archivos de configuración..."

# Verificar que env.example existe
if [ -f "env.example" ]; then
    report_success "Archivo env.example existe"
else
    report_issue "Archivo env.example no existe"
fi

# Verificar que .gitignore incluye archivos sensibles
if grep -q "\.env" .gitignore; then
    report_success ".gitignore incluye archivos .env"
else
    report_issue ".gitignore no incluye archivos .env"
fi

if grep -q "\.key" .gitignore; then
    report_success ".gitignore incluye archivos .key"
else
    report_issue ".gitignore no incluye archivos .key"
fi

echo ""
echo "4. 🐳 Verificando configuración de Docker..."

# Verificar que docker-compose.yml no tenga claves hardcodeadas
if grep -q "SUPABASE_SERVICE_ROLE_KEY=" docker-compose.yml; then
    if grep -q "\${SUPABASE_SERVICE_ROLE_KEY}" docker-compose.yml; then
        report_success "Docker Compose usa variables de entorno correctamente"
    else
        report_issue "Docker Compose tiene claves hardcodeadas"
    fi
else
    report_success "Docker Compose no tiene claves hardcodeadas"
fi

echo ""
echo "5. 🔧 Verificando scripts de inicio..."

# Verificar que los scripts no tengan claves hardcodeadas
if grep -q "HOLDED_API_KEY=" start-app.sh; then
    if grep -q "\$HOLDED_API_KEY" start-app.sh; then
        report_success "Scripts usan variables de entorno correctamente"
    else
        report_issue "Scripts tienen claves hardcodeadas"
    fi
else
    report_success "Scripts no tienen claves hardcodeadas"
fi

echo ""
echo "6. 📊 Verificando archivos de backup..."

# Verificar que no haya archivos de backup sensibles
if find . -name "*.sql" -not -path "./supabase/migrations/*" 2>/dev/null | grep -q .; then
    report_warning "Archivos .sql encontrados fuera de migrations/"
else
    report_success "No hay archivos .sql sensibles"
fi

if find . -name "*backup*" -not -path "./backup-data/*" 2>/dev/null | grep -q .; then
    report_warning "Archivos de backup encontrados fuera de backup-data/"
else
    report_success "No hay archivos de backup sensibles"
fi

echo ""
echo "7. 🌐 Verificando URLs y endpoints..."

# Verificar que no haya URLs de producción hardcodeadas
if grep -r "https://.*\.supabase\.co" src/ --exclude-dir=node_modules 2>/dev/null; then
    report_warning "URLs de Supabase de producción encontradas en el código"
else
    report_success "No hay URLs de producción hardcodeadas"
fi

echo ""
echo "8. 🔒 Verificando permisos de archivos..."

# Verificar permisos de archivos sensibles
if [ -f ".env" ]; then
    PERMS=$(stat -c "%a" .env 2>/dev/null)
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "640" ]; then
        report_success "Permisos de .env son seguros ($PERMS)"
    else
        report_warning "Permisos de .env podrían ser inseguros ($PERMS)"
    fi
fi

echo ""
echo "=================================================="
echo "📋 RESUMEN DE SEGURIDAD"
echo "=================================================="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Excelente! No se encontraron problemas de seguridad críticos.${NC}"
    echo -e "${GREEN}✅ El proyecto está listo para ser compartido de forma segura.${NC}"
else
    echo -e "${RED}⚠️  Se encontraron $ISSUES problema(s) de seguridad que deben ser corregidos.${NC}"
    echo -e "${YELLOW}🔧 Revisa los problemas reportados antes de hacer commit.${NC}"
fi

echo ""
echo "💡 RECOMENDACIONES ADICIONALES:"
echo "   • Nunca commitees archivos .env"
echo "   • Usa variables de entorno para todas las claves"
echo "   • Rota las claves API regularmente"
echo "   • Configura HTTPS en producción"
echo "   • Revisa los logs regularmente"
echo "   • Mantén las dependencias actualizadas"

echo ""
echo "🔗 Para más información sobre seguridad, consulta SECURITY-GUIDE.md"

exit $ISSUES
