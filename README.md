# 🎭 Flamenco Sync Studio

**Sistema de gestión empresarial completo con integración Holded y WooCommerce**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Local-green.svg)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)

## 📋 Descripción

Flamenco Sync Studio es una aplicación web completa de gestión empresarial que incluye:

- 👥 **Gestión de empleados** con sistema de fichaje
- 📦 **Gestión de productos** e inventario
- 🛒 **Gestión de encargos** y pedidos
- 💰 **Facturación** con integración Holded
- 📊 **Dashboard** con métricas en tiempo real
- 🔔 **Sistema de notificaciones** (Email, WhatsApp)
- 🔐 **Autenticación** y control de roles
- 🌐 **Integración WooCommerce** (opcional)

## 🚀 Características Principales

### Gestión de Personal
- Sistema de fichaje entrada/salida
- Gestión de empleados con roles
- Control de incidencias
- Historial de fichajes

### Gestión Comercial
- Catálogo de productos
- Gestión de encargos
- Sistema de facturación
- Integración con Holded API

### Dashboard y Reportes
- Métricas en tiempo real
- Gráficos de productividad
- Estados de fichaje actual
- Resumen de actividades

### Integraciones
- **Holded**: Sincronización de facturas y pagos
- **WooCommerce**: Sincronización de pedidos (opcional)
- **Notificaciones**: Email y WhatsApp

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + PostgREST + Auth)
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Contenedores**: Docker + Docker Compose
- **API Gateway**: Kong
- **Integraciones**: Holded API, WooCommerce API

## 📦 Requisitos del Sistema

### Mínimos
- **OS**: Linux (Ubuntu/Debian) o macOS
- **RAM**: 4GB mínimo, 8GB recomendado
- **Disco**: 10GB de espacio libre
- **Docker**: 20.10+
- **Node.js**: 18+ (recomendado 20+)
- **npm**: 9+

### Recomendados
- **OS**: Ubuntu 22.04 LTS o Debian 12
- **RAM**: 8GB+
- **Disco**: 20GB+ SSD
- **Docker**: 24+
- **Node.js**: 20+

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/flamenco-sync-studio.git
cd flamenco-sync-studio
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

**Configuración mínima requerida:**
```env
# Supabase Local
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Base de datos
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# Holded (opcional)
HOLDED_API_KEY=tu-clave-holded
```

### 3. Instalar dependencias
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del Edge Function
cd edge-local
npm install
cd ..
```

### 4. Iniciar la aplicación
```bash
# Dar permisos de ejecución
chmod +x start-app.sh stop-app.sh

# Iniciar todo el stack
./start-app.sh
```

### 5. Acceder a la aplicación
- **Frontend**: http://localhost:8080
- **Supabase Studio**: http://localhost:8000
- **Edge Function**: http://localhost:3004

**Credenciales por defecto:**
- Email: `admin@admin.com`
- Contraseña: `admin123`

## 🐳 Despliegue con Docker

### Inicio rápido
```bash
# Iniciar solo los servicios de Docker
docker-compose up -d

# Verificar que todo esté funcionando
docker-compose ps
```

### Servicios incluidos
- **PostgreSQL**: Base de datos principal
- **Supabase**: Backend completo (Auth, PostgREST, Storage)
- **Kong**: API Gateway
- **Edge Function**: Integración Holded/WooCommerce

## 🌐 Despliegue en Servidor

### Requisitos del servidor
- Ubuntu 22.04 LTS o Debian 12
- Docker y Docker Compose instalados
- Nginx (opcional, para proxy reverso)
- Dominio o IP pública

### Pasos de despliegue

#### 1. Preparar el servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

#### 2. Configurar la aplicación
```bash
# Clonar en el servidor
git clone https://github.com/tu-usuario/flamenco-sync-studio.git
cd flamenco-sync-studio

# Configurar variables de entorno
cp env.example .env
nano .env

# Instalar dependencias
npm install
cd edge-local && npm install && cd ..
```

#### 3. Configurar servicios del sistema
```bash
# Crear servicio para Edge Function
sudo tee /etc/systemd/system/flamenco-edge.service > /dev/null <<EOF
[Unit]
Description=Flamenco Edge Function
After=network.target

[Service]
Type=simple
User=flamenco
WorkingDirectory=/home/flamenco/flamenco-sync-studio/edge-local
ExecStart=/usr/bin/node index.mjs
Environment=SUPABASE_SERVICE_ROLE_KEY=tu-service-key
Environment=HOLDED_API_KEY=tu-holded-key
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Crear servicio para Frontend
sudo tee /etc/systemd/system/flamenco-frontend.service > /dev/null <<EOF
[Unit]
Description=Flamenco Frontend
After=network.target

[Service]
Type=simple
User=flamenco
WorkingDirectory=/home/flamenco/flamenco-sync-studio
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Habilitar servicios
sudo systemctl enable flamenco-edge flamenco-frontend
```

#### 4. Configurar Nginx (opcional)
```bash
# Instalar Nginx
sudo apt install nginx -y

# Configurar proxy reverso
sudo tee /etc/nginx/sites-available/flamenco > /dev/null <<EOF
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/flamenco /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Iniciar la aplicación
```bash
# Iniciar Docker
docker-compose up -d

# Iniciar servicios del sistema
sudo systemctl start flamenco-edge flamenco-frontend

# Verificar estado
sudo systemctl status flamenco-edge flamenco-frontend
```

## 🔧 Configuración Avanzada

### Variables de entorno importantes

```env
# URLs de la aplicación
VITE_SUPABASE_URL=http://localhost:8000
VITE_APP_URL=http://localhost:8080

# Base de datos
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# Autenticación
JWT_SECRET=tu-jwt-secret-muy-seguro

# Integraciones
HOLDED_API_KEY=tu-clave-holded
WOOCOMMERCE_URL=https://tu-tienda.com
WOOCOMMERCE_CONSUMER_KEY=tu-consumer-key
WOOCOMMERCE_CONSUMER_SECRET=tu-consumer-secret

# Notificaciones
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
TWILIO_ACCOUNT_SID=tu-twilio-sid
TWILIO_AUTH_TOKEN=tu-twilio-token
```

### Configuración de Holded

1. Obtener API Key de Holded
2. Configurar webhooks en Holded
3. Actualizar `HOLDED_API_KEY` en `.env`

### Configuración de WooCommerce

1. Crear aplicación en WooCommerce
2. Obtener Consumer Key y Secret
3. Configurar variables en `.env`

## 📊 Gestión de Datos

### Backup de la base de datos
```bash
# Crear backup
docker exec flamenco_db pg_dump -U postgres postgres > backup.sql

# Restaurar backup
docker exec -i flamenco_db psql -U postgres postgres < backup.sql
```

### Migración de datos
```bash
# Exportar datos a CSV
./scripts/export-data.sh

# Importar datos desde CSV
./scripts/import-data.sh
```

## 🔒 Seguridad

### Configuración de firewall
```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Variables sensibles
- Nunca commitees archivos `.env`
- Usa secretos de Docker para producción
- Rota las claves API regularmente
- Configura HTTPS en producción

## 🐛 Solución de Problemas

### Problemas comunes

#### 1. Error "Could not find the function"
```bash
# Refrescar caché de PostgREST
docker-compose restart rest meta realtime
```

#### 2. Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté corriendo
docker exec flamenco_db pg_isready -U postgres

# Reiniciar servicios
docker-compose restart db
```

#### 3. Error de permisos
```bash
# Dar permisos a los scripts
chmod +x *.sh

# Verificar permisos de Docker
sudo usermod -aG docker $USER
```

#### 4. Puerto ocupado
```bash
# Verificar puertos en uso
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8000

# Matar proceso si es necesario
sudo kill -9 PID_DEL_PROCESO
```

### Logs y debugging
```bash
# Ver logs de Docker
docker-compose logs -f

# Ver logs de servicios específicos
docker-compose logs -f db
docker-compose logs -f rest

# Ver logs del Edge Function
tail -f edge-local/edge-function.log

# Ver logs del Frontend
tail -f frontend.log
```

## 📚 Documentación Adicional

- [Guía de Despliegue](README-DESPLIEGUE.md)
- [Configuración Docker](README-Docker.md)
- [Desarrollo Local](README-Local.md)
- [Guía de Seguridad](SECURITY-GUIDE.md)
- [Configuración de Notificaciones](NOTIFICACIONES-SETUP.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/flamenco-sync-studio/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/flamenco-sync-studio/wiki)
- **Email**: soporte@flamencosync.com

## 🎯 Roadmap

- [ ] App móvil (React Native)
- [ ] Integración con más ERPs
- [ ] Sistema de reportes avanzado
- [ ] API pública
- [ ] Modo offline
- [ ] Multi-idioma

---

**Desarrollado con ❤️ para la gestión empresarial moderna**