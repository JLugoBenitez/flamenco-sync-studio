#!/bin/bash

# ===========================================
# Script para iniciar Supabase con Docker
# ===========================================

set -e

echo "🚀 Iniciando Flamenco Sync Studio con Docker..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear directorio para datos de PostgreSQL si no existe
mkdir -p ./data/postgres

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado. Revisa y ajusta las variables según necesites."
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Construir e iniciar los servicios
echo "🔨 Construyendo e iniciando servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "✅ ¡Servicios iniciados correctamente!"
echo ""
echo "🌐 URLs disponibles:"
echo "   • Supabase Studio: http://localhost:3000"
echo "   • API Gateway: http://localhost:8000"
echo "   • PostgreSQL: localhost:5432"
echo "   • Storage API: http://localhost:5000"
echo "   • Realtime: ws://localhost:4000"
echo ""
echo "📋 Para ver los logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para detener los servicios:"
echo "   docker-compose down"
echo ""
echo "💡 Tu aplicación React debe usar:"
echo "   VITE_SUPABASE_URL=http://localhost:8000"
echo "   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
