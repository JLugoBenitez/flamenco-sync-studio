#!/bin/bash

# ===========================================
# SCRIPT PARA PARAR FLAMENCO SYNC STUDIO
# Para todos los servicios de forma segura
# ===========================================

echo "🛑 PARANDO FLAMENCO SYNC STUDIO..."
echo "=================================="

# 1. PARAR FRONTEND
echo "🎨 Parando Frontend..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# 2. PARAR EDGE FUNCTION
echo "⚡ Parando Edge Function..."
pkill -f "node index.mjs" 2>/dev/null || true

# 3. PARAR DOCKER (OPCIONAL - comentado para no romper la BBDD)
echo "🐳 Docker sigue corriendo (base de datos preservada)"
echo "   Si quieres parar Docker también: docker-compose down"

echo ""
echo "✅ Servicios parados correctamente"
echo "🗄️  Base de datos sigue corriendo para preservar datos"
