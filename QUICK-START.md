# ⚡ Inicio Rápido - Flamenco Sync Studio

## 🚀 Instalación en 5 minutos

### 1. Clonar y configurar
```bash
git clone https://github.com/tu-usuario/flamenco-sync-studio.git
cd flamenco-sync-studio
cp env.example .env
```

### 2. Instalar dependencias
```bash
npm install
cd edge-local && npm install && cd ..
```

### 3. Iniciar aplicación
```bash
chmod +x start-app.sh
./start-app.sh
```

### 4. Acceder
- **App**: http://localhost:8080
- **Usuario**: admin@admin.com
- **Contraseña**: admin123

---

## 🐳 Solo con Docker

```bash
# Iniciar solo servicios Docker
docker-compose up -d

# Verificar
docker-compose ps
```

---

## 🔧 Comandos Útiles

```bash
# Parar aplicación
./stop-app.sh

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Backup DB
docker exec flamenco_db pg_dump -U postgres postgres > backup.sql
```

---

## ⚠️ Solución Rápida de Problemas

### Error de puerto ocupado
```bash
sudo lsof -ti:8080 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

### Error de permisos
```bash
chmod +x *.sh
sudo usermod -aG docker $USER
```

### Error de base de datos
```bash
docker-compose restart db
sleep 10
docker-compose restart rest
```

---

**¿Necesitas ayuda?** Ver [README.md](README.md) para documentación completa.
