#!/bin/bash

# ===========================================
# SCRIPT MAESTRO - FLAMENCO SYNC STUDIO
# Inicia toda la aplicación de una vez
# ===========================================

echo "🚀 INICIANDO FLAMENCO SYNC STUDIO..."
echo "======================================"

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Puerto $1 ya está en uso"
        return 0
    else
        echo "❌ Puerto $1 libre"
        return 1
    fi
}

# Función para esperar a que un servicio esté listo
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Esperando a que $service_name esté listo..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name está listo!"
            return 0
        fi
        echo "   Intento $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name no respondió después de $max_attempts intentos"
    return 1
}

# 1. VERIFICAR DOCKER
echo ""
echo "🐳 Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Iniciando Docker..."
    sudo systemctl start docker
    sleep 5
fi

# 2. INICIAR SERVICIOS DE DOCKER
echo ""
echo "🐳 Iniciando servicios de Docker..."
if ! check_port 5432; then
    echo "   Iniciando PostgreSQL..."
    docker-compose up -d postgres
    sleep 5
fi

if ! check_port 8000; then
    echo "   Iniciando Supabase..."
    docker-compose up -d
    sleep 10
fi

# 3. ESPERAR A QUE SUPABASE ESTÉ LISTO
wait_for_service "http://localhost:8000/rest/v1/" "Supabase"

# 4. INICIAR EDGE FUNCTION
echo ""
echo "⚡ Iniciando Edge Function..."
if ! check_port 3004; then
    echo "   Matando procesos anteriores..."
    pkill -f "node index.mjs" 2>/dev/null || true
    sleep 2
    
    echo "   Iniciando Edge Function..."
    cd edge-local
    export SUPABASE_SERVICE_ROLE_KEY="SUPABASE_SERVICE_ROLE_KEY"
    nohup node index.mjs > ../edge-function.log 2>&1 &
    cd ..
    sleep 3
fi

# 5. ESPERAR A QUE EDGE FUNCTION ESTÉ LISTO
wait_for_service "http://localhost:3004/holded-sync" "Edge Function"

# 6. INICIAR FRONTEND
echo ""
echo "🎨 Iniciando Frontend..."
if ! check_port 8080; then
    echo "   Iniciando Vite..."
    nohup npm run dev > frontend.log 2>&1 &
    sleep 5
fi

# 7. ESPERAR A QUE FRONTEND ESTÉ LISTO
wait_for_service "http://localhost:8080" "Frontend"

# 8. MOSTRAR ESTADO FINAL
echo ""
echo "🎉 ¡APLICACIÓN INICIADA COMPLETAMENTE!"
echo "======================================"
echo "🌐 Frontend:     http://localhost:8080"
echo "⚡ Edge Function: http://localhost:3004"
echo "🗄️  Supabase:     http://localhost:8000"
echo ""
echo "📋 Servicios activos:"
echo "   ✅ PostgreSQL (puerto 5432)"
echo "   ✅ Supabase (puerto 8000)"
echo "   ✅ Edge Function (puerto 3004)"
echo "   ✅ Frontend (puerto 8080)"
echo ""
echo "🔧 Para parar todos los servicios:"
echo "   ./stop-app.sh"
echo ""
echo "📝 Logs disponibles:"
echo "   - Frontend: frontend.log"
echo "   - Edge Function: edge-function.log"
echo ""
echo "🚀 ¡LISTO PARA USAR!"
