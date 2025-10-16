@echo off
echo.
echo ========================================
echo  🚀 Flamenco Sync Studio - Windows
echo ========================================
echo.

REM Verificar que Docker esté instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado o no está en el PATH
    echo.
    echo Por favor instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado o no está en el PATH
    echo.
    echo Por favor instala Node.js desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Docker y Node.js detectados correctamente
echo.

REM Verificar que el archivo .env existe
if not exist .env (
    echo 📝 Creando archivo .env desde env.example...
    copy env.example .env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 1️⃣ Iniciando servicios Docker...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Error al iniciar servicios Docker
    echo.
    echo Posibles soluciones:
    echo - Verificar que Docker Desktop esté corriendo
    echo - Verificar que los puertos estén libres
    echo - Ejecutar como administrador
    echo.
    pause
    exit /b 1
)

echo ✅ Servicios Docker iniciados
echo.

echo 2️⃣ Esperando que los servicios estén listos...
timeout /t 10 /nobreak >nul

echo 3️⃣ Instalando dependencias de Node.js...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    echo.
    echo Posibles soluciones:
    echo - Verificar conexión a internet
    echo - Ejecutar como administrador
    echo - Limpiar caché: npm cache clean --force
    echo.
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

echo 4️⃣ Verificando estado de servicios...
docker-compose ps

echo.
echo ========================================
echo  ✅ INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo 🌐 URLs disponibles:
echo    • Aplicación Principal: http://localhost:8080
echo    • Supabase Studio:      http://localhost:3000
echo    • API Gateway:          http://localhost:8000
echo.
echo 👤 Usuario de prueba:
echo    • Email:    admin@admin.com
echo    • Password: admin123
echo.
echo 5️⃣ Iniciando aplicación React...
echo    Presiona Ctrl+C para detener la aplicación
echo.

npm run dev

echo.
echo ✅ Aplicación detenida
pause
