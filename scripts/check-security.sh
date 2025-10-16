#!/bin/bash

echo ""
echo "========================================"
echo " 🔐 Verificación de Seguridad"
echo "========================================"
echo ""

# Función para verificar archivos sensibles
check_sensitive_files() {
    local pattern=$1
    local description=$2
    local found_files=$(find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" -not -path "./dist/*" 2>/dev/null)
    
    if [ -n "$found_files" ]; then
        echo "❌ $description encontrados:"
        echo "$found_files" | while read file; do
            echo "   $file"
        done
        return 1
    else
        echo "✅ $description: No encontrados"
        return 0
    fi
}

# Función para verificar contenido sensible
check_sensitive_content() {
    local pattern=$1
    local description=$2
    local files=$(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
    
    local found=false
    while IFS= read -r file; do
        if [ -f "$file" ] && grep -q "$pattern" "$file" 2>/dev/null; then
            if [ "$found" = false ]; then
                echo "❌ $description encontrado en archivos:"
                found=true
            fi
            echo "   $file"
        fi
    done <<< "$files"
    
    if [ "$found" = false ]; then
        echo "✅ $description: No encontrado en código"
        return 0
    else
        return 1
    fi
}

echo "🔍 Verificando archivos sensibles..."
echo ""

# Verificar archivos de variables de entorno (solo si no están protegidos)
env_files=$(find . -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ -n "$env_files" ]; then
    # Verificar si están protegidos por .gitignore
    protected=true
    while IFS= read -r file; do
        if ! git check-ignore "$file" >/dev/null 2>&1; then
            protected=false
            break
        fi
    done <<< "$env_files"
    
    if [ "$protected" = true ]; then
        echo "✅ Archivos .env: Encontrados pero protegidos por .gitignore"
    else
        echo "❌ Archivos .env encontrados (no protegidos):"
        echo "$env_files" | while read file; do
            echo "   $file"
        done
    fi
else
    echo "✅ Archivos .env: No encontrados"
fi
check_sensitive_files ".env.local" "Archivos .env.local"
check_sensitive_files ".env.production" "Archivos .env.production"
check_sensitive_files "*.key" "Archivos de claves"
check_sensitive_files "*.pem" "Certificados PEM"
check_sensitive_files "*.p12" "Certificados P12"
check_sensitive_files "*.pfx" "Certificados PFX"
check_sensitive_files "secrets.json" "Archivos secrets.json"
check_sensitive_files "credentials.json" "Archivos credentials.json"

echo ""
echo "🔍 Verificando contenido sensible en código..."
echo ""

# Verificar claves hardcodeadas
check_sensitive_content "sk-[a-zA-Z0-9]{20,}" "Claves de API de OpenAI"
check_sensitive_content "AKIA[0-9A-Z]{16}" "Claves de AWS"
check_sensitive_content "AIza[0-9A-Za-z_-]{35}" "Claves de Google API"
check_sensitive_content "ya29\.[0-9A-Za-z_-]+" "Tokens de Google OAuth"
check_sensitive_content "xoxb-[0-9]{11}-[0-9]{11}-[0-9A-Za-z]{24}" "Tokens de Slack Bot"
check_sensitive_content "xoxp-[0-9]{11}-[0-9]{11}-[0-9A-Za-z]{24}" "Tokens de Slack User"

# Verificar conexiones de base de datos con credenciales
check_sensitive_content "postgres://[^:]+:[^@]+@" "Conexiones PostgreSQL con credenciales"
check_sensitive_content "mysql://[^:]+:[^@]+@" "Conexiones MySQL con credenciales"
check_sensitive_content "mongodb://[^:]+:[^@]+@" "Conexiones MongoDB con credenciales"

# Verificar JWT secrets hardcodeados (patrones comunes)
check_sensitive_content "jwt.*secret.*=.*[\"'][^\"']{20,}" "JWT secrets hardcodeados"

echo ""
echo "🔍 Verificando configuración de Git..."
echo ""

# Verificar que .env está en .gitignore
if git check-ignore .env >/dev/null 2>&1; then
    echo "✅ .env está protegido por .gitignore"
else
    echo "❌ .env NO está protegido por .gitignore"
fi

# Verificar que no hay archivos sensibles en el staging
staged_sensitive=$(git diff --cached --name-only | grep -E "\.(env|key|pem|sql|backup)$" 2>/dev/null)
if [ -z "$staged_sensitive" ]; then
    echo "✅ No hay archivos sensibles en el staging area"
else
    echo "❌ Archivos sensibles en el staging area:"
    echo "$staged_sensitive" | while read file; do
        echo "   $file"
    done
fi

# Verificar que no hay archivos sensibles en el historial reciente
recent_sensitive=$(git log --name-only --oneline -10 | grep -E "\.(env|key|pem|sql|backup)$" 2>/dev/null)
if [ -z "$recent_sensitive" ]; then
    echo "✅ No se encontraron archivos sensibles en commits recientes"
else
    echo "⚠️  Archivos sensibles encontrados en commits recientes:"
    echo "$recent_sensitive" | while read file; do
        echo "   $file"
    done
    echo ""
    echo "   Considera limpiar el historial de Git si estos archivos contienen datos sensibles"
fi

echo ""
echo "========================================"
echo " 📋 RESUMEN DE SEGURIDAD"
echo "========================================"
echo ""

# Contar problemas encontrados
issues=0

# Verificar archivos sensibles
env_files=$(find . -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ -n "$env_files" ]; then
    # Solo contar como problema si no están protegidos
    protected=true
    while IFS= read -r file; do
        if ! git check-ignore "$file" >/dev/null 2>&1; then
            protected=false
            break
        fi
    done <<< "$env_files"
    
    if [ "$protected" = false ]; then
        echo "❌ Problema: Archivos .env encontrados (no protegidos)"
        ((issues++))
    fi
fi

if find . -name "*.key" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | grep -q .; then
    echo "❌ Problema: Archivos de claves encontrados"
    ((issues++))
fi

if find . -name "secrets.json" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | grep -q .; then
    echo "❌ Problema: Archivos secrets.json encontrados"
    ((issues++))
fi

if [ $issues -eq 0 ]; then
    echo "🎉 ¡Excelente! No se encontraron problemas de seguridad"
    echo ""
    echo "✅ Tu proyecto está configurado de forma segura"
    echo "✅ Las claves están protegidas correctamente"
    echo "✅ El .gitignore está funcionando"
else
    echo "⚠️  Se encontraron $issues problema(s) de seguridad"
    echo ""
    echo "🔧 Acciones recomendadas:"
    echo "   1. Eliminar archivos sensibles del proyecto"
    echo "   2. Agregar archivos al .gitignore"
    echo "   3. Usar variables de entorno en su lugar"
    echo "   4. Revisar el historial de Git si es necesario"
fi

echo ""
echo "📚 Para más información, consulta:"
echo "   - SECURITY.md"
echo "   - README-DESPLIEGUE.md"
echo ""

if [ $issues -gt 0 ]; then
    exit 1
else
    exit 0
fi
