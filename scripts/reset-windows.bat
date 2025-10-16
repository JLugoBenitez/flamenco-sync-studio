@echo off
echo.
echo ========================================
echo  ⚠️  RESET COMPLETO DEL SISTEMA
echo ========================================
echo.
echo 🚨 ADVERTENCIA: Esta operación eliminará TODOS los datos
echo.
echo Esto incluye:
echo    • Todos los datos de la base de datos
echo    • Configuraciones personalizadas
echo    • Archivos de usuario
echo    • Historial de fichajes
echo.
set /p confirm=¿Estás SEGURO de que quieres continuar? (escribe 'SI' para confirmar): 

if /i not "%confirm%"=="SI" (
    echo.
    echo ❌ Operación cancelada por el usuario
    pause
    exit /b 0
)

echo.
echo 🔄 Iniciando reset completo...

echo 1️⃣ Deteniendo servicios...
docker-compose down

echo 2️⃣ Eliminando contenedores y volúmenes...
docker-compose down -v --remove-orphans

echo 3️⃣ Eliminando imágenes Docker...
docker system prune -a --volumes -f

echo 4️⃣ Limpiando caché de Node.js...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)

echo 5️⃣ Recreando archivo .env...
if exist .env (
    del .env
)
copy env.example .env

echo.
echo ========================================
echo  ✅ RESET COMPLETADO
echo ========================================
echo.
echo 🎯 Próximos pasos:
echo    1. Ejecuta start-windows.bat para reinstalar
echo    2. O ejecuta manualmente:
echo       - docker-compose up -d
echo       - npm install
echo       - npm run dev
echo.
pause
