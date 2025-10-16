# 🏠 Flamenco Sync Studio - Desarrollo Local

Este proyecto está configurado para funcionar completamente en local usando Docker y Supabase local.

## 🚀 Inicio Rápido

### 1. Iniciar todo el entorno
```bash
./scripts/dev-local.sh dev
```

### 2. Iniciar tu aplicación React
```bash
npm run dev
```

### 3. Acceder a Supabase Studio
Abre http://localhost:3000 en tu navegador

## 📋 Servicios Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Supabase Studio** | http://localhost:3000 | Interfaz web para gestionar la base de datos |
| **API Gateway** | http://localhost:8000 | Punto de entrada unificado |
| **API REST** | http://localhost:8000/rest/v1 | API para consultas de datos |
| **Auth API** | http://localhost:8000/auth/v1 | API de autenticación |
| **PostgreSQL** | localhost:5432 | Base de datos principal |

## 🛠️ Comandos de Gestión

### Gestión de Servicios
```bash
# Iniciar todos los servicios
./scripts/dev-local.sh start

# Detener todos los servicios
./scripts/dev-local.sh stop

# Reiniciar servicios
./scripts/dev-local.sh restart

# Ver estado de servicios
./scripts/dev-local.sh status

# Ver logs
./scripts/dev-local.sh logs
./scripts/dev-local.sh logs auth  # Logs específicos
```

### Desarrollo
```bash
# Iniciar entorno completo de desarrollo
./scripts/dev-local.sh dev

# Abrir Supabase Studio
./scripts/dev-local.sh studio

# Ver documentación de API
./scripts/dev-local.sh api

# Conectar a la base de datos
./scripts/dev-local.sh db
```

### Mantenimiento
```bash
# Reset completo (¡CUIDADO! Elimina todos los datos)
./scripts/dev-local.sh reset
```

## 🗄️ Base de Datos

### Estructura de Tablas
- **empleados** - Información de empleados
- **productos** - Catálogo de productos
- **clientes** - Base de datos de clientes
- **encargos** - Pedidos y encargos
- **fichajes** - Control de horarios
- **incidencias** - Gestión de incidencias
- **facturas** - Facturación
- **profiles** - Perfiles de usuario
- **user_roles** - Roles de usuario
- **configuracion** - Configuración del sistema

### Conectar a PostgreSQL
```bash
# Usando el script
./scripts/dev-local.sh db

# O directamente
docker exec -it flamenco_db psql -U postgres -d postgres
```

## 🔧 Configuración

### Variables de Entorno
El archivo `.env` está configurado para desarrollo local:

```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cambiar entre Local y Cloud
Para cambiar a Supabase Cloud, modifica el archivo `.env`:

```env
# Para Supabase Cloud
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica

# Para desarrollo local (comentado)
# VITE_SUPABASE_URL=http://localhost:8000
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Gestión de Datos

### Supabase Studio
1. Abre http://localhost:3000
2. Navega a "Table Editor"
3. Gestiona tus datos directamente

### API REST
```bash
# Obtener todos los empleados
curl http://localhost:8000/rest/v1/empleados

# Obtener productos
curl http://localhost:8000/rest/v1/productos

# Con autenticación
curl -H "Authorization: Bearer tu-token" http://localhost:8000/rest/v1/empleados
```

## 🔍 Solución de Problemas

### Servicios no inician
```bash
# Ver logs detallados
./scripts/dev-local.sh logs

# Reiniciar completamente
./scripts/dev-local.sh restart
```

### Base de datos no responde
```bash
# Verificar estado
./scripts/dev-local.sh status

# Reiniciar solo la base de datos
docker compose restart db
```

### Puerto ocupado
```bash
# Ver qué usa el puerto
lsof -i :3000
lsof -i :8000

# Detener servicios
./scripts/dev-local.sh stop
```

### Reset completo
```bash
# ¡CUIDADO! Elimina todos los datos
./scripts/dev-local.sh reset
```

## 📁 Estructura del Proyecto

```
flamenco-sync-studio/
├── src/                    # Código fuente React
├── supabase/              # Configuración Supabase
├── scripts/               # Scripts de gestión
│   ├── dev-local.sh      # Script principal
│   ├── start-docker.sh   # Iniciar Docker
│   ├── stop-docker.sh    # Detener Docker
│   └── reset-docker.sh   # Reset Docker
├── docker-compose.yml     # Configuración Docker
├── kong.yml              # Configuración API Gateway
├── .env                  # Variables de entorno
└── README-Local.md       # Esta documentación
```

## 🎯 Flujo de Desarrollo

1. **Iniciar entorno**: `./scripts/dev-local.sh dev`
2. **Abrir Supabase Studio**: http://localhost:3000
3. **Iniciar app React**: `npm run dev`
4. **Desarrollar**: Modifica código en `src/`
5. **Gestionar datos**: Usa Supabase Studio
6. **Probar API**: Usa http://localhost:8000

## 💡 Consejos

- **Mantén Docker corriendo**: Los servicios necesitan estar activos
- **Usa Supabase Studio**: Es la forma más fácil de gestionar datos
- **Revisa logs**: Si algo falla, usa `./scripts/dev-local.sh logs`
- **Backup de datos**: Los datos se guardan en volúmenes de Docker
- **Desarrollo offline**: Todo funciona sin conexión a internet

## 🆘 Ayuda

Si tienes problemas:

1. Verifica el estado: `./scripts/dev-local.sh status`
2. Revisa los logs: `./scripts/dev-local.sh logs`
3. Reinicia servicios: `./scripts/dev-local.sh restart`
4. Si todo falla: `./scripts/dev-local.sh reset` (¡elimina datos!)

---

**¡Disfruta desarrollando en local! 🚀**

