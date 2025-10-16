@echo off
echo.
echo ========================================
echo  🛑 Deteniendo Flamenco Sync Studio
echo ========================================
echo.

echo 🔄 Deteniendo servicios Docker...
docker-compose down

if %errorlevel% neq 0 (
    echo ❌ Error al detener servicios
    echo.
    echo Intentando forzar detención...
    docker-compose down --remove-orphans
)

echo ✅ Servicios detenidos
echo.

echo 📊 Estado actual de contenedores:
docker-compose ps

echo.
echo ✅ Proceso completado
pause
