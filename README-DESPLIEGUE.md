# 🚀 Flamenco Sync Studio - Guía de Despliegue

Esta es una aplicación completa de gestión para estudios de flamenco que incluye:
- **Gestión de empleados** y control de fichajes
- **Catálogo de productos** y gestión de stock
- **Sistema de encargos** y clientes
- **Facturación** integrada
- **Sincronización** con WooCommerce y Holded
- **Dashboard** con métricas en tiempo real

## 📋 Requisitos del Sistema

### Mínimos Recomendados:
- **RAM**: 4GB disponibles
- **Disco**: 2GB de espacio libre
- **Puertos libres**: 3000, 4000, 5432, 8000, 8080, 9999
- **Sistema operativo**: Windows 10/11, Linux (Ubuntu/Debian), macOS

### Software Necesario:
- **Docker Desktop** (incluye Docker Compose)
- **Node.js** (versión 18 o superior)
- **Git** (para clonar el repositorio)

## 🎯 Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd flamenco-sync-studio
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de configuración
cp env.example .env
```

### 3. Iniciar el Sistema
```bash
# Opción A: Script automático (recomendado)
./scripts/start-docker.sh

# Opción B: Manual
docker-compose up -d
npm install
npm run dev
```

### 4. Acceder a la Aplicación
- **Aplicación Principal**: http://localhost:8080
- **Supabase Studio**: http://localhost:3000

## 🖥️ Guías por Sistema Operativo

### [Windows](#windows)
- Instalación de Docker Desktop
- Configuración de WSL2 (recomendado)
- Scripts de PowerShell

### [Linux](#linux)
- Instalación de Docker
- Configuración de permisos
- Scripts de Bash

### [macOS](#macos)
- Instalación de Docker Desktop
- Configuración de Homebrew
- Scripts de Bash

---

## 🪟 Windows

### Prerrequisitos

#### 1. Instalar Docker Desktop
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Ejecuta el instalador como administrador
3. Reinicia el equipo
4. Verifica la instalación abriendo PowerShell y ejecutando:
```powershell
docker --version
docker-compose --version
```

#### 2. Instalar Node.js
1. Descarga Node.js desde: https://nodejs.org/
2. Selecciona la versión LTS (recomendada)
3. Ejecuta el instalador
4. Verifica la instalación:
```powershell
node --version
npm --version
```

#### 3. Instalar Git
1. Descarga Git desde: https://git-scm.com/download/win
2. Ejecuta el instalador con opciones por defecto
3. Verifica la instalación:
```powershell
git --version
```

### Instalación del Proyecto

#### 1. Clonar el Repositorio
```powershell
# Abrir PowerShell como administrador
git clone <URL_DEL_REPOSITORIO>
cd flamenco-sync-studio
```

#### 2. Configurar Variables de Entorno
```powershell
# Copiar archivo de configuración
copy env.example .env
```

#### 3. Iniciar Docker Desktop
- Abre Docker Desktop desde el menú inicio
- Espera a que aparezca "Docker Desktop is running"

#### 4. Ejecutar el Proyecto
```powershell
# Iniciar servicios de base de datos
docker-compose up -d

# Instalar dependencias
npm install

# Iniciar aplicación
npm run dev
```

#### 5. Verificar Instalación
- Abre http://localhost:8080 en tu navegador
- Abre http://localhost:3000 para Supabase Studio

### Scripts para Windows

Crea estos archivos `.bat` en la carpeta `scripts/`:

#### `start-windows.bat`
```batch
@echo off
echo Iniciando Flamenco Sync Studio...
echo.
echo 1. Iniciando servicios Docker...
docker-compose up -d
echo.
echo 2. Instalando dependencias...
npm install
echo.
echo 3. Iniciando aplicación...
echo.
echo ✅ Aplicación disponible en: http://localhost:8080
echo ✅ Supabase Studio en: http://localhost:3000
echo.
npm run dev
```

#### `stop-windows.bat`
```batch
@echo off
echo Deteniendo Flamenco Sync Studio...
docker-compose down
echo ✅ Servicios detenidos
```

#### `reset-windows.bat`
```batch
@echo off
echo ⚠️  ADVERTENCIA: Esto eliminará todos los datos
set /p confirm=¿Estás seguro? (s/N): 
if /i "%confirm%"=="s" (
    echo Deteniendo y eliminando contenedores...
    docker-compose down -v
    echo Eliminando imágenes...
    docker system prune -a --volumes
    echo ✅ Reset completo realizado
) else (
    echo Operación cancelada
)
```

### Solución de Problemas en Windows

#### Docker no inicia
```powershell
# Verificar que Hyper-V esté habilitado
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All

# Si no está habilitado, ejecutar como administrador:
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

#### WSL2 no funciona
```powershell
# Actualizar WSL2
wsl --update
wsl --set-default-version 2
```

#### Puertos ocupados
```powershell
# Ver qué proceso usa un puerto
netstat -ano | findstr :8080

# Terminar proceso por PID
taskkill /PID <PID> /F
```

---

## 🐧 Linux

### Prerrequisitos

#### 1. Instalar Docker
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Reiniciar sesión o ejecutar:
newgrp docker
```

#### 2. Instalar Node.js
```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### 3. Instalar Git
```bash
sudo apt install git -y
```

### Instalación del Proyecto

#### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd flamenco-sync-studio
```

#### 2. Configurar Variables de Entorno
```bash
cp env.example .env
```

#### 3. Dar Permisos a Scripts
```bash
chmod +x scripts/*.sh
```

#### 4. Ejecutar el Proyecto
```bash
# Opción A: Script automático (recomendado)
./scripts/start-docker.sh

# Opción B: Manual
docker-compose up -d
npm install
npm run dev
```

#### 5. Verificar Instalación
```bash
# Verificar servicios
docker-compose ps

# Abrir aplicación
xdg-open http://localhost:8080
```

### Scripts para Linux

Los scripts ya están incluidos en el proyecto:

#### `start-docker.sh`
```bash
#!/bin/bash
echo "🚀 Iniciando Flamenco Sync Studio..."
echo "1. Iniciando servicios Docker..."
docker-compose up -d

echo "2. Esperando que los servicios estén listos..."
sleep 10

echo "3. Instalando dependencias..."
npm install

echo "✅ Servicios iniciados:"
echo "   - Aplicación: http://localhost:8080"
echo "   - Supabase Studio: http://localhost:3000"
echo "   - API Gateway: http://localhost:8000"

echo "4. Iniciando aplicación..."
npm run dev
```

#### `stop-docker.sh`
```bash
#!/bin/bash
echo "🛑 Deteniendo Flamenco Sync Studio..."
docker-compose down
echo "✅ Servicios detenidos"
```

#### `reset-docker.sh`
```bash
#!/bin/bash
echo "⚠️  ADVERTENCIA: Esto eliminará todos los datos"
read -p "¿Estás seguro? (s/N): " confirm
if [[ $confirm == [sS] ]]; then
    echo "🔄 Reseteando sistema..."
    docker-compose down -v
    docker system prune -a --volumes
    echo "✅ Reset completo realizado"
else
    echo "❌ Operación cancelada"
fi
```

### Solución de Problemas en Linux

#### Permisos de Docker
```bash
# Si tienes problemas de permisos:
sudo chmod 666 /var/run/docker.sock
# O mejor, agregar usuario al grupo docker:
sudo usermod -aG docker $USER
# Y reiniciar sesión
```

#### Puertos ocupados
```bash
# Ver qué proceso usa un puerto
sudo lsof -i :8080

# Terminar proceso
sudo kill -9 <PID>
```

#### Docker no inicia
```bash
# Verificar estado del servicio
sudo systemctl status docker

# Iniciar servicio
sudo systemctl start docker

# Habilitar inicio automático
sudo systemctl enable docker
```

---

## 🍎 macOS

### Prerrequisitos

#### 1. Instalar Docker Desktop
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Arrastra la aplicación a la carpeta Applications
3. Abre Docker Desktop
4. Verifica la instalación:
```bash
docker --version
docker-compose --version
```

#### 2. Instalar Node.js (usando Homebrew)
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Verificar instalación
node --version
npm --version
```

#### 3. Instalar Git
```bash
brew install git
```

### Instalación del Proyecto

#### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd flamenco-sync-studio
```

#### 2. Configurar Variables de Entorno
```bash
cp env.example .env
```

#### 3. Ejecutar el Proyecto
```bash
# Dar permisos a scripts
chmod +x scripts/*.sh

# Iniciar servicios
./scripts/start-docker.sh
```

#### 4. Verificar Instalación
```bash
# Abrir aplicación
open http://localhost:8080
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

El archivo `.env` contiene todas las configuraciones necesarias:

```env
# URLs de Supabase (Docker local)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Base de datos PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres

# Configuración de autenticación
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
```

### Puertos Utilizados

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| 3000 | Supabase Studio | Interfaz web de administración |
| 4000 | Realtime | WebSocket para tiempo real |
| 5432 | PostgreSQL | Base de datos |
| 8000 | Kong API Gateway | API principal |
| 8080 | React App | Aplicación frontend |
| 9999 | Auth Service | Servicio de autenticación |

### Cambiar Puertos

Si necesitas cambiar algún puerto, edita `docker-compose.yml`:

```yaml
services:
  studio:
    ports:
      - "3001:3000"  # Cambiar puerto externo a 3001
```

Y actualiza las variables de entorno correspondientes.

---

## 🚀 Despliegue en Producción

### Opción 1: Supabase Cloud (Recomendado)

1. **Crear proyecto en Supabase**:
   - Ve a https://supabase.com
   - Crea un nuevo proyecto
   - Copia la URL y las claves API

2. **Actualizar variables de entorno**:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
```

3. **Ejecutar migraciones**:
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Ejecutar migraciones
supabase db push
```

4. **Desplegar frontend**:
   - Netlify, Vercel, o tu hosting preferido
   - Configurar variables de entorno en el hosting

### Opción 2: VPS/Dedicado

1. **Configurar servidor**:
   - Ubuntu 20.04+ recomendado
   - Docker y Docker Compose
   - Nginx como proxy reverso

2. **Configurar dominio**:
   - Aplicar certificado SSL
   - Configurar DNS

3. **Configurar backup automático**:
```bash
# Script de backup diario
#!/bin/bash
docker exec flamenco_db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

---

## 🆘 Solución de Problemas Comunes

### Problema: "Puerto ya en uso"

**Solución**:
```bash
# Encontrar proceso que usa el puerto
lsof -i :8080  # Linux/macOS
netstat -ano | findstr :8080  # Windows

# Terminar proceso
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Problema: "Docker no inicia"

**Solución**:
```bash
# Verificar estado
docker info

# Reiniciar Docker
sudo systemctl restart docker  # Linux
# Reiniciar Docker Desktop en Windows/macOS
```

### Problema: "Error de permisos"

**Solución**:
```bash
# Linux: Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar permisos
docker run hello-world
```

### Problema: "Base de datos no conecta"

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs
docker-compose logs db

# Reiniciar servicio
docker-compose restart db
```

### Problema: "Aplicación no carga"

**Solución**:
```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Ver logs de la aplicación
docker-compose logs studio

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoreo y Mantenimiento

### Verificar Estado del Sistema

```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats

# Logs en tiempo real
docker-compose logs -f

# Espacio en disco
docker system df
```

### Backup de Datos

```bash
# Backup manual
docker exec flamenco_db pg_dump -U postgres postgres > backup.sql

# Backup automático (agregar a crontab)
0 2 * * * cd /ruta/al/proyecto && docker exec flamenco_db pg_dump -U postgres postgres > backup_$(date +\%Y\%m\%d).sql
```

### Limpieza del Sistema

```bash
# Limpiar contenedores parados
docker container prune

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpieza completa
docker system prune -a --volumes
```

---

## 📞 Soporte y Ayuda

### Recursos Útiles

- **Documentación de Docker**: https://docs.docker.com/
- **Documentación de Supabase**: https://supabase.com/docs
- **Documentación de React**: https://reactjs.org/docs/

### Obtener Ayuda

1. **Revisa los logs**: `docker-compose logs`
2. **Verifica el estado**: `docker-compose ps`
3. **Consulta la documentación**: README-Docker.md y README-Local.md
4. **Revisa las issues**: En el repositorio de GitHub

### Comandos de Emergencia

```bash
# Reset completo (¡CUIDADO! Elimina datos)
./scripts/reset-docker.sh

# Ver logs de todos los servicios
docker-compose logs --tail=100

# Reiniciar todo
docker-compose restart

# Estado detallado
docker-compose ps -a
```

---

## 🎉 ¡Listo!

Una vez completada la instalación, tendrás acceso a:

- ✅ **Aplicación principal**: http://localhost:8080
- ✅ **Supabase Studio**: http://localhost:3000  
- ✅ **API Gateway**: http://localhost:8000
- ✅ **Base de datos**: PostgreSQL en puerto 5432

### Usuarios de Prueba

Después de la primera ejecución, puedes usar:
- **Email**: admin@admin.com
- **Contraseña**: admin123

### Próximos Pasos

1. **Explora la aplicación**: Navega por todas las funcionalidades
2. **Configura datos**: Agrega empleados, productos, clientes
3. **Personaliza**: Modifica la configuración según tus necesidades
4. **Despliega**: Cuando esté listo, sigue la guía de producción

**¡Disfruta usando Flamenco Sync Studio! 🎭**
