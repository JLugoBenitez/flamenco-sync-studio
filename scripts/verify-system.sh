#!/bin/bash

echo ""
echo "========================================"
echo " 🔍 Verificación del Sistema"
echo "========================================"
echo ""

# Función para verificar comando
check_command() {
    local cmd=$1
    local name=$2
    local install_url=$3
    
    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>/dev/null | head -n1)
        echo "✅ $name: $version"
        return 0
    else
        echo "❌ $name: No instalado"
        if [ ! -z "$install_url" ]; then
            echo "   Instalar desde: $install_url"
        fi
        return 1
    fi
}

# Verificar comandos básicos
echo "🔧 Verificando software requerido:"
echo ""

docker_ok=false
node_ok=false
git_ok=false

if check_command "docker" "Docker" "https://www.docker.com/products/docker-desktop"; then
    docker_ok=true
fi

if check_command "node" "Node.js" "https://nodejs.org/"; then
    node_ok=true
fi

if check_command "git" "Git" "https://git-scm.com/"; then
    git_ok=true
fi

echo ""

# Verificar Docker Compose
if [ "$docker_ok" = true ]; then
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose: $(docker-compose --version)"
    elif docker compose version &> /dev/null; then
        echo "✅ Docker Compose: $(docker compose version --short)"
    else
        echo "❌ Docker Compose: No disponible"
        docker_ok=false
    fi
fi

echo ""

# Verificar permisos de Docker
if [ "$docker_ok" = true ]; then
    echo "🔐 Verificando permisos de Docker:"
    if docker info &> /dev/null; then
        echo "✅ Permisos de Docker: OK"
    else
        echo "❌ Permisos de Docker: No tienes permisos"
        echo "   Solución: sudo usermod -aG docker \$USER"
        echo "   Luego reinicia la sesión"
        docker_ok=false
    fi
fi

echo ""

# Verificar puertos
echo "🌐 Verificando puertos disponibles:"
ports=(3000 4000 5432 8000 8080 9999)
all_ports_free=true

for port in "${ports[@]}"; do
    if lsof -i :$port &> /dev/null || netstat -an | grep -q ":$port "; then
        echo "❌ Puerto $port: En uso"
        all_ports_free=false
    else
        echo "✅ Puerto $port: Libre"
    fi
done

echo ""

# Verificar archivos del proyecto
echo "📁 Verificando archivos del proyecto:"
required_files=("package.json" "docker-compose.yml" "env.example")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file: Presente"
    else
        echo "❌ $file: No encontrado"
        echo "   Asegúrate de estar en el directorio correcto del proyecto"
    fi
done

echo ""

# Verificar archivo .env
if [ -f ".env" ]; then
    echo "✅ .env: Presente"
else
    echo "⚠️  .env: No encontrado (se creará automáticamente)"
fi

echo ""

# Verificar estado de Docker
if [ "$docker_ok" = true ]; then
    echo "🐳 Estado de Docker:"
    if docker info &> /dev/null; then
        echo "✅ Docker está corriendo"
        
        # Verificar contenedores del proyecto
        if command -v docker-compose &> /dev/null; then
            echo "📊 Contenedores del proyecto:"
            docker-compose ps 2>/dev/null || echo "   No hay contenedores corriendo"
        elif docker compose version &> /dev/null; then
            echo "📊 Contenedores del proyecto:"
            docker compose ps 2>/dev/null || echo "   No hay contenedores corriendo"
        fi
    else
        echo "❌ Docker no está corriendo"
        echo "   Inicia Docker Desktop o ejecuta: sudo systemctl start docker"
    fi
fi

echo ""

# Resumen final
echo "========================================"
echo " 📋 RESUMEN"
echo "========================================"

if [ "$docker_ok" = true ] && [ "$node_ok" = true ] && [ "$git_ok" = true ] && [ "$all_ports_free" = true ]; then
    echo "🎉 ¡Sistema listo para ejecutar Flamenco Sync Studio!"
    echo ""
    echo "Para iniciar el proyecto ejecuta:"
    echo "   ./scripts/start-linux.sh"
    echo ""
    echo "O manualmente:"
    echo "   docker-compose up -d"
    echo "   npm install"
    echo "   npm run dev"
else
    echo "⚠️  Sistema no está completamente listo"
    echo ""
    echo "Problemas encontrados:"
    [ "$docker_ok" = false ] && echo "   - Docker no está instalado o configurado"
    [ "$node_ok" = false ] && echo "   - Node.js no está instalado"
    [ "$git_ok" = false ] && echo "   - Git no está instalado"
    [ "$all_ports_free" = false ] && echo "   - Algunos puertos están ocupados"
    echo ""
    echo "Resuelve estos problemas antes de continuar"
fi

echo ""
