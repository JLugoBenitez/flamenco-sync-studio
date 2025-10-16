#!/bin/bash

# ===========================================
# Script para resetear completamente Supabase con Docker
# ===========================================

set -e

echo "🔄 Reseteando Flamenco Sync Studio..."

# Detener y eliminar contenedores, volúmenes e imágenes
if command -v docker-compose &> /dev/null; then
    docker-compose down -v --rmi all
else
    docker compose down -v --rmi all
fi

# Limpiar contenedores huérfanos
echo "🧹 Limpiando contenedores huérfanos..."
docker container prune -f

# Limpiar volúmenes no utilizados
echo "🧹 Limpiando volúmenes no utilizados..."
docker volume prune -f

# Limpiar redes no utilizadas
echo "🧹 Limpiando redes no utilizadas..."
docker network prune -f

echo "✅ Reset completado!"
echo ""
echo "🚀 Para iniciar de nuevo:"
echo "   ./scripts/start-docker.sh"
