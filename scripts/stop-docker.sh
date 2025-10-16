#!/bin/bash

# ===========================================
# Script para detener Supabase con Docker
# ===========================================

set -e

echo "🛑 Deteniendo Flamenco Sync Studio..."

# Detener contenedores
if command -v docker-compose &> /dev/null; then
    docker-compose down
else
    docker compose down
fi

echo "✅ Servicios detenidos correctamente!"
echo ""
echo "💡 Para eliminar también los volúmenes (datos):"
echo "   docker-compose down -v"
echo ""
echo "💡 Para eliminar también las imágenes:"
echo "   docker-compose down --rmi all"
