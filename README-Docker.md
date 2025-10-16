# 🐳 Dockerización de Flamenco Sync Studio

Este documento explica cómo usar Docker para ejecutar localmente la base de datos Supabase de Flamenco Sync Studio.

## 📋 Requisitos Previos

- Docker instalado
- Docker Compose instalado
- Al menos 4GB de RAM disponible
- Puertos 3000, 4000, 5000, 5432, 8000, 9999 libres

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar las variables si es necesario
nano .env
```

### 2. Iniciar los servicios

```bash
# Usar el script de inicio (recomendado)
./scripts/start-docker.sh

# O manualmente
docker-compose up -d
```

### 3. Inicializar la base de datos

```bash
# Ejecutar migraciones y crear datos de prueba
./scripts/init-db.sh
```

## 🌐 URLs Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Supabase Studio | http://localhost:3000 | Interfaz web de administración |
| API Gateway | http://localhost:8000 | Punto de entrada principal |
| PostgreSQL | localhost:5432 | Base de datos directa |
| Storage API | http://localhost:5000 | API de almacenamiento |
| Realtime | ws://localhost:4000 | WebSocket para tiempo real |

## 🔧 Configuración de la Aplicación

Para que tu aplicación React se conecte a Supabase local, configura estas variables en tu `.env`:

```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 📊 Gestión de Datos

### Ver logs de los servicios

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f db
docker-compose logs -f studio
```

### Acceder a la base de datos directamente

```bash
# Conectarse a PostgreSQL
docker exec -it flamenco_db psql -U postgres -d postgres

# O desde tu máquina local (si tienes psql instalado)
psql -h localhost -p 5432 -U postgres -d postgres
```

### Backup y restauración

```bash
# Crear backup
docker exec flamenco_db pg_dump -U postgres postgres > backup.sql

# Restaurar backup
docker exec -i flamenco_db psql -U postgres -d postgres < backup.sql
```

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `./scripts/start-docker.sh` | Inicia todos los servicios |
| `./scripts/stop-docker.sh` | Detiene todos los servicios |
| `./scripts/reset-docker.sh` | Resetea completamente (elimina datos) |
| `./scripts/init-db.sh` | Inicializa la BD con datos de prueba |

## 🔐 Usuarios de Prueba

Después de ejecutar `init-db.sh`, tendrás estos usuarios:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@flamencropuro.es | admin123 | admin |

## 🗂️ Estructura de Archivos

```
├── docker-compose.yml          # Configuración de servicios
├── kong.yml                    # Configuración del API Gateway
├── env.example                 # Variables de entorno de ejemplo
├── scripts/
│   ├── start-docker.sh         # Iniciar servicios
│   ├── stop-docker.sh          # Detener servicios
│   ├── reset-docker.sh         # Reset completo
│   └── init-db.sh              # Inicializar BD
└── supabase/
    ├── config.toml             # Configuración de Supabase
    ├── migrations/             # Migraciones de BD
    └── functions/              # Edge Functions
```

## 🐛 Solución de Problemas

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :5432

# Detener el proceso
sudo kill -9 <PID>
```

### Limpiar Docker completamente

```bash
# Detener y eliminar todo
docker-compose down -v --rmi all

# Limpiar sistema Docker
docker system prune -a --volumes
```

### Verificar estado de servicios

```bash
# Estado de contenedores
docker-compose ps

# Logs de un servicio específico
docker-compose logs db
```

## 📝 Notas Importantes

1. **Datos persistentes**: Los datos se almacenan en volúmenes Docker, por lo que persisten entre reinicios.

2. **Rendimiento**: Para desarrollo local está bien, pero para producción usa Supabase Cloud.

3. **Seguridad**: Las claves JWT son de ejemplo. En producción, genera claves seguras.

4. **Recursos**: Los servicios pueden consumir bastante RAM. Ajusta según tu sistema.

## 🔄 Migración a Producción

Para migrar a Supabase Cloud:

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta las migraciones en el proyecto cloud
3. Actualiza las variables de entorno con las URLs reales
4. Configura las políticas RLS según tus necesidades

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica que los puertos estén libres
3. Asegúrate de tener Docker actualizado
4. Revisa la documentación de Supabase
