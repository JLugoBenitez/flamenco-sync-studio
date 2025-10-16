#!/bin/bash

echo ""
echo "========================================"
echo " 🚀 Flamenco Sync Studio - Linux/macOS"
echo "========================================"
echo ""

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo ""
    echo "Por favor instala Docker ejecutando:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sudo sh get-docker.sh"
    echo "sudo usermod -aG docker \$USER"
    echo ""
    exit 1
fi

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo ""
    echo "Por favor instala Node.js desde:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Docker y Node.js detectados correctamente"
echo ""

# Verificar que el archivo .env existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "1️⃣ Iniciando servicios Docker..."

# Detener contenedores existentes
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Iniciar servicios
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar servicios Docker"
    echo ""
    echo "Posibles soluciones:"
    echo "- Verificar que Docker esté corriendo: sudo systemctl start docker"
    echo "- Verificar que los puertos estén libres"
    echo "- Ejecutar con permisos: sudo usermod -aG docker \$USER"
    echo "- Reiniciar sesión después de agregar usuario al grupo docker"
    echo ""
    exit 1
fi

echo "✅ Servicios Docker iniciados"
echo ""

echo "2️⃣ Esperando que los servicios estén listos..."
sleep 15

echo "3️⃣ Verificando estado de servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "4️⃣ Instalando dependencias de Node.js..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    echo ""
    echo "Posibles soluciones:"
    echo "- Verificar conexión a internet"
    echo "- Limpiar caché: npm cache clean --force"
    echo "- Eliminar node_modules y reinstalar: rm -rf node_modules package-lock.json && npm install"
    echo ""
    exit 1
fi

echo "✅ Dependencias instaladas"
echo ""

echo "========================================"
echo " ✅ INSTALACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "🌐 URLs disponibles:"
echo "   • Aplicación Principal: http://localhost:8080"
echo "   • Supabase Studio:      http://localhost:3000"
echo "   • API Gateway:          http://localhost:8000"
echo ""
echo "👤 Usuario de prueba:"
echo "   • Email:    admin@admin.com"
echo "   • Password: admin123"
echo ""
echo "5️⃣ Iniciando aplicación React..."
echo "   Presiona Ctrl+C para detener la aplicación"
echo ""

npm run dev
