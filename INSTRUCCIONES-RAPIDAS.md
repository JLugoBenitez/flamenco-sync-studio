# ⚡ Instrucciones Rápidas de Despliegue

## 🎯 Instalación en 3 Pasos

### 1️⃣ Prerequisitos
- **Docker Desktop** (Windows/Mac) o **Docker** (Linux)
- **Node.js** (versión 18+)
- **Git**

### 2️⃣ Descargar y Configurar
```bash
# Clonar repositorio
git clone <URL_DEL_REPOSITORIO>
cd flamenco-sync-studio

# Configurar variables de entorno
cp env.example .env
```

### 3️⃣ Iniciar Sistema

**Windows:**
```cmd
scripts\start-windows.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/*.sh
./scripts/start-linux.sh
```

## 🌐 URLs de Acceso

Una vez iniciado:
- **Aplicación**: http://localhost:8080
- **Admin Panel**: http://localhost:3000
- **API**: http://localhost:8000

## 👤 Usuario de Prueba
- **Email**: admin@admin.com
- **Contraseña**: admin123

## 🛑 Detener Sistema

**Windows:**
```cmd
scripts\stop-windows.bat
```

**Linux/macOS:**
```bash
./scripts/stop-docker.sh
```

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs

# Reiniciar servicios
docker-compose restart

# Reset completo (elimina datos)
./scripts/reset-docker.sh
```

## 📚 Documentación Completa

Para instrucciones detalladas, consulta:
- **[README-DESPLIEGUE.md](README-DESPLIEGUE.md)** - Guía completa
- **[README.md](README.md)** - Información general del proyecto

## 🆘 Problemas Comunes

### Puerto ocupado
```bash
# Ver qué usa el puerto
lsof -i :8080  # Linux/Mac
netstat -ano | findstr :8080  # Windows
```

### Docker no inicia
- **Windows**: Reiniciar Docker Desktop
- **Linux**: `sudo systemctl start docker`
- **Mac**: Reiniciar Docker Desktop

### Permisos en Linux
```bash
sudo usermod -aG docker $USER
# Reiniciar sesión
```

---

**¡Listo! Tu sistema Flamenco Sync Studio estará funcionando en pocos minutos. 🎭**
