# 🚀 Guía de Despliegue Completa

## 📋 Índice
1. [Preparación del Servidor](#preparación-del-servidor)
2. [Instalación de Dependencias](#instalación-de-dependencias)
3. [Configuración de la Aplicación](#configuración-de-la-aplicación)
4. [Configuración de Servicios](#configuración-de-servicios)
5. [Configuración de Nginx](#configuración-de-nginx)
6. [Configuración de SSL](#configuración-de-ssl)
7. [Monitoreo y Logs](#monitoreo-y-logs)
8. [Backup y Restauración](#backup-y-restauración)

## 🖥️ Preparación del Servidor

### Requisitos Mínimos
- **OS**: Ubuntu 22.04 LTS o Debian 12
- **RAM**: 4GB mínimo, 8GB recomendado
- **Disco**: 20GB SSD
- **CPU**: 2 cores mínimo
- **Red**: IP pública o dominio

### 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop
```

### 2. Crear usuario para la aplicación
```bash
# Crear usuario flamenco
sudo adduser flamenco
sudo usermod -aG sudo flamenco
sudo usermod -aG docker flamenco

# Cambiar al usuario flamenco
su - flamenco
```

## 📦 Instalación de Dependencias

### 1. Instalar Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

### 2. Instalar Node.js
```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Verificar instalación
node --version
npm --version
```

### 3. Instalar herramientas adicionales
```bash
sudo apt install -y nginx ufw fail2ban
```

## ⚙️ Configuración de la Aplicación

### 1. Clonar el repositorio
```bash
cd /home/flamenco
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

**Configuración para producción:**
```env
# URLs de producción
VITE_SUPABASE_URL=http://localhost:8000
VITE_APP_URL=http://tu-dominio.com
VITE_API_URL=http://tu-dominio.com/api

# Base de datos
POSTGRES_PASSWORD=tu-password-seguro
POSTGRES_DB=flamenco_prod

# JWT Secret (generar uno seguro)
JWT_SECRET=$(openssl rand -base64 32)

# Integraciones
HOLDED_API_KEY=tu-clave-holded-real
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

### 3. Instalar dependencias
```bash
# Frontend
npm install

# Edge Function
cd edge-local
npm install
cd ..
```

## 🔧 Configuración de Servicios

### 1. Crear servicio para Edge Function
```bash
sudo tee /etc/systemd/system/flamenco-edge.service > /dev/null <<EOF
[Unit]
Description=Flamenco Edge Function
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=flamenco
Group=flamenco
WorkingDirectory=/home/flamenco/flamenco-sync-studio/edge-local
ExecStart=/usr/bin/node index.mjs
Environment=NODE_ENV=production
Environment=SUPABASE_SERVICE_ROLE_KEY=tu-service-key
Environment=HOLDED_API_KEY=tu-holded-key
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 2. Crear servicio para Frontend
```bash
sudo tee /etc/systemd/system/flamenco-frontend.service > /dev/null <<EOF
[Unit]
Description=Flamenco Frontend
After=network.target

[Service]
Type=simple
User=flamenco
Group=flamenco
WorkingDirectory=/home/flamenco/flamenco-sync-studio
ExecStart=/usr/bin/npm run dev
Environment=NODE_ENV=production
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 3. Crear servicio para Docker Compose
```bash
sudo tee /etc/systemd/system/flamenco-docker.service > /dev/null <<EOF
[Unit]
Description=Flamenco Docker Services
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/flamenco/flamenco-sync-studio
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
```

### 4. Habilitar servicios
```bash
sudo systemctl daemon-reload
sudo systemctl enable flamenco-docker flamenco-edge flamenco-frontend
```

## 🌐 Configuración de Nginx

### 1. Configurar proxy reverso
```bash
sudo tee /etc/nginx/sites-available/flamenco > /dev/null <<EOF
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Edge Function
    location /edge/ {
        proxy_pass http://localhost:3004/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Responsive design support
    add_header X-UA-Compatible "IE=edge" always;
}
EOF
```

### 2. Habilitar sitio
```bash
sudo ln -s /etc/nginx/sites-available/flamenco /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Configuración de SSL

### 1. Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtener certificado SSL
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 3. Configurar renovación automática
```bash
sudo crontab -e
# Añadir esta línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Logs

### 1. Configurar logrotate
```bash
sudo tee /etc/logrotate.d/flamenco > /dev/null <<EOF
/home/flamenco/flamenco-sync-studio/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 flamenco flamenco
}
EOF
```

### 2. Script de monitoreo
```bash
tee /home/flamenco/monitor.sh > /dev/null <<EOF
#!/bin/bash
echo "=== Flamenco Sync Studio Status ==="
echo "Docker Services:"
docker compose ps
echo ""
echo "System Services:"
systemctl is-active flamenco-docker flamenco-edge flamenco-frontend
echo ""
echo "Disk Usage:"
df -h /home/flamenco
echo ""
echo "Memory Usage:"
free -h
EOF

chmod +x /home/flamenco/monitor.sh
```

### 3. Configurar alertas
```bash
# Instalar mailutils para alertas por email
sudo apt install mailutils -y

# Configurar script de alertas
tee /home/flamenco/alert.sh > /dev/null <<EOF
#!/bin/bash
if ! systemctl is-active --quiet flamenco-docker; then
    echo "Flamenco Docker service is down!" | mail -s "Flamenco Alert" admin@tu-dominio.com
fi
EOF

chmod +x /home/flamenco/alert.sh

# Añadir a crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/flamenco/alert.sh") | crontab -
```

## 💾 Backup y Restauración

### 1. Script de backup automático
```bash
tee /home/flamenco/backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/home/flamenco/backups"
DATE=\$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p \$BACKUP_DIR

# Backup de la base de datos
docker exec flamenco_db pg_dump -U postgres postgres > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup de archivos de configuración
tar -czf \$BACKUP_DIR/config_backup_\$DATE.tar.gz .env docker-compose.yml

# Limpiar backups antiguos (mantener últimos 7 días)
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: \$DATE"
EOF

chmod +x /home/flamenco/backup.sh

# Programar backup diario
(crontab -l 2>/dev/null; echo "0 2 * * * /home/flamenco/backup.sh") | crontab -
```

### 2. Script de restauración
```bash
tee /home/flamenco/restore.sh > /dev/null <<EOF
#!/bin/bash
if [ -z "\$1" ]; then
    echo "Uso: ./restore.sh <fecha_backup>"
    echo "Ejemplo: ./restore.sh 20240115_020000"
    exit 1
fi

BACKUP_DIR="/home/flamenco/backups"
DATE=\$1

# Verificar que existe el backup
if [ ! -f "\$BACKUP_DIR/db_backup_\$DATE.sql" ]; then
    echo "Error: No se encontró el backup para la fecha \$DATE"
    exit 1
fi

# Parar servicios
systemctl stop flamenco-frontend flamenco-edge

# Restaurar base de datos
docker exec -i flamenco_db psql -U postgres postgres < \$BACKUP_DIR/db_backup_\$DATE.sql

# Reiniciar servicios
systemctl start flamenco-docker flamenco-edge flamenco-frontend

echo "Restauración completada"
EOF

chmod +x /home/flamenco/restore.sh
```

## 🚀 Iniciar la Aplicación

### 1. Iniciar todos los servicios
```bash
# Iniciar Docker
sudo systemctl start flamenco-docker

# Esperar a que esté listo
sleep 30

# Iniciar Edge Function y Frontend
sudo systemctl start flamenco-edge flamenco-frontend
```

### 2. Verificar estado
```bash
# Verificar servicios
sudo systemctl status flamenco-docker flamenco-edge flamenco-frontend

# Verificar Docker
docker compose ps

# Verificar logs
sudo journalctl -u flamenco-edge -f
sudo journalctl -u flamenco-frontend -f
```

### 3. Probar la aplicación
```bash
# Verificar que responde
curl -I http://tu-dominio.com
curl -I http://tu-dominio.com/api/health
```

## 🔧 Comandos Útiles

### Gestión de servicios
```bash
# Iniciar todo
sudo systemctl start flamenco-docker flamenco-edge flamenco-frontend

# Parar todo
sudo systemctl stop flamenco-frontend flamenco-edge flamenco-docker

# Reiniciar todo
sudo systemctl restart flamenco-docker flamenco-edge flamenco-frontend

# Ver estado
sudo systemctl status flamenco-*
```

### Gestión de Docker
```bash
# Ver contenedores
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Parar todo
docker compose down
```

### Logs y debugging
```bash
# Logs en tiempo real
sudo journalctl -u flamenco-edge -f
sudo journalctl -u flamenco-frontend -f

# Logs de Docker
docker compose logs -f db
docker compose logs -f rest

# Verificar conectividad
curl http://localhost:8000/health
curl http://localhost:3004/health
```

## ✅ Checklist de Despliegue

- [ ] Servidor preparado con requisitos mínimos
- [ ] Docker y Docker Compose instalados
- [ ] Node.js 20+ instalado
- [ ] Aplicación clonada y configurada
- [ ] Variables de entorno configuradas
- [ ] Servicios systemd creados y habilitados
- [ ] Nginx configurado como proxy reverso
- [ ] SSL configurado (opcional)
- [ ] Scripts de backup configurados
- [ ] Monitoreo configurado
- [ ] Aplicación funcionando correctamente
- [ ] Dominio apuntando al servidor
- [ ] Firewall configurado
- [ ] Alertas configuradas

---

**¡Tu aplicación Flamenco Sync Studio está lista para producción! 🎉**
