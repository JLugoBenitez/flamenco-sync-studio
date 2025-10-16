#!/bin/bash

# ===========================================
# Script de gestión para desarrollo local
# Flamenco Sync Studio - Setup Local
# ===========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🚀 Flamenco Sync Studio - Gestión Local${NC}"
    echo "=========================================="
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Iniciar todos los servicios"
    echo "  stop      - Detener todos los servicios"
    echo "  restart   - Reiniciar todos los servicios"
    echo "  status    - Ver estado de los servicios"
    echo "  logs      - Ver logs de los servicios"
    echo "  studio    - Abrir Supabase Studio"
    echo "  api       - Ver documentación de la API"
    echo "  db        - Conectar a la base de datos"
    echo "  reset     - Resetear completamente (¡CUIDADO!)"
    echo "  dev       - Iniciar desarrollo completo"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 start"
    echo "  $0 dev"
    echo "  $0 logs auth"
}

# Función para verificar Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose no está instalado${NC}"
        exit 1
    fi
}

# Función para iniciar servicios
start_services() {
    echo -e "${BLUE}🚀 Iniciando servicios de Flamenco Sync Studio...${NC}"
    
    check_docker
    
    # Iniciar Docker Compose
    docker compose up -d
    
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "  📊 Supabase Studio: http://localhost:3000"
    echo "  🔗 API Gateway: http://localhost:8000"
    echo "  📚 API Docs: http://localhost:8000/rest/v1"
    echo "  🔐 Auth API: http://localhost:8000/auth/v1"
    echo ""
    echo "💡 Para ver logs: $0 logs"
    echo "💡 Para ver estado: $0 status"
}

# Función para detener servicios
stop_services() {
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    docker compose down
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
    docker compose down
    sleep 2
    docker compose up -d
    echo -e "${GREEN}✅ Servicios reiniciados${NC}"
}

# Función para ver estado
show_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    echo "=========================="
    docker compose ps
    echo ""
    
    # Verificar conectividad
    echo -e "${BLUE}🔍 Verificando conectividad:${NC}"
    
    # Verificar API Gateway
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        echo -e "  ✅ API Gateway: http://localhost:8000"
    else
        echo -e "  ❌ API Gateway: No disponible"
    fi
    
    # Verificar Supabase Studio
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  ✅ Supabase Studio: http://localhost:3000"
    else
        echo -e "  ❌ Supabase Studio: No disponible"
    fi
    
    # Verificar base de datos
    if docker exec flamenco_db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "  ✅ PostgreSQL: Conectado"
    else
        echo -e "  ❌ PostgreSQL: No disponible"
    fi
}

# Función para ver logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        echo -e "${BLUE}📋 Logs de todos los servicios:${NC}"
        docker compose logs -f
    else
        echo -e "${BLUE}📋 Logs de $service:${NC}"
        docker compose logs -f "$service"
    fi
}

# Función para abrir Supabase Studio
open_studio() {
    echo -e "${BLUE}🌐 Abriendo Supabase Studio...${NC}"
    
    # Verificar que esté funcionando
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Supabase Studio disponible en: http://localhost:3000${NC}"
        
        # Intentar abrir en el navegador
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        elif command -v open &> /dev/null; then
            open http://localhost:3000
        else
            echo "💡 Abre manualmente: http://localhost:3000"
        fi
    else
        echo -e "${RED}❌ Supabase Studio no está disponible${NC}"
        echo "💡 Ejecuta: $0 start"
    fi
}

# Función para mostrar API
show_api() {
    echo -e "${BLUE}📚 Documentación de la API:${NC}"
    echo "============================="
    echo ""
    echo "🌐 API Gateway: http://localhost:8000"
    echo "📖 Documentación: http://localhost:8000/rest/v1"
    echo ""
    echo "🔗 Endpoints principales:"
    echo "  📊 Tablas: http://localhost:8000/rest/v1/[tabla]"
    echo "  🔐 Auth: http://localhost:8000/auth/v1"
    echo "  ⚡ Realtime: ws://localhost:4000"
    echo ""
    echo "📋 Tablas disponibles:"
    echo "  - empleados"
    echo "  - productos"
    echo "  - clientes"
    echo "  - encargos"
    echo "  - fichajes"
    echo "  - incidencias"
    echo "  - facturas"
    echo "  - profiles"
    echo "  - user_roles"
    echo "  - configuracion"
    echo ""
    echo "💡 Ejemplo de consulta:"
    echo "  curl http://localhost:8000/rest/v1/empleados"
}

# Función para conectar a la base de datos
connect_db() {
    echo -e "${BLUE}🗄️ Conectando a la base de datos...${NC}"
    docker exec -it flamenco_db psql -U postgres -d postgres
}

# Función para resetear todo
reset_all() {
    echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos${NC}"
    echo "¿Estás seguro? Escribe 'RESET' para confirmar:"
    read -r confirmation
    
    if [ "$confirmation" = "RESET" ]; then
        echo -e "${YELLOW}🔄 Reseteando todo...${NC}"
        docker compose down -v
        docker system prune -f
        echo -e "${GREEN}✅ Reset completado${NC}"
        echo "💡 Ejecuta: $0 start"
    else
        echo -e "${GREEN}✅ Reset cancelado${NC}"
    fi
}

# Función para desarrollo completo
start_dev() {
    echo -e "${BLUE}🚀 Iniciando entorno de desarrollo completo...${NC}"
    
    # Iniciar servicios
    start_services
    
    # Esperar un poco para que se inicien
    echo -e "${YELLOW}⏳ Esperando que los servicios se inicien...${NC}"
    sleep 10
    
    # Verificar estado
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 ¡Entorno de desarrollo listo!${NC}"
    echo ""
    echo "📝 Próximos pasos:"
    echo "  1. 🌐 Abre Supabase Studio: http://localhost:3000"
    echo "  2. 🚀 Inicia tu app React: npm run dev"
    echo "  3. 📊 Gestiona datos desde Supabase Studio"
    echo ""
    echo "💡 Comandos útiles:"
    echo "  - Ver logs: $0 logs"
    echo "  - Estado: $0 status"
    echo "  - Detener: $0 stop"
}

# Función principal
main() {
    case "${1:-help}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        studio)
            open_studio
            ;;
        api)
            show_api
            ;;
        db)
            connect_db
            ;;
        reset)
            reset_all
            ;;
        dev)
            start_dev
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando desconocido: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"

