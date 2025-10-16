# 🎭 Flamenco Sync Studio

**Sistema completo de gestión para estudios de flamenco**

Una aplicación web moderna desarrollada con React, TypeScript y Supabase que proporciona todas las herramientas necesarias para gestionar un estudio de flamenco profesional.

## 🌟 Características Principales

- **👥 Gestión de Empleados**: Control completo de personal y fichajes
- **📦 Catálogo de Productos**: Gestión de inventario y stock
- **🛒 Sistema de Encargos**: Pedidos y seguimiento de clientes
- **💰 Facturación**: Sistema integrado de facturación
- **🔄 Sincronización**: Integración con WooCommerce y Holded
- **📊 Dashboard**: Métricas y estadísticas en tiempo real
- **🔐 Autenticación**: Sistema seguro de usuarios y roles

## 🚀 Instalación Rápida

### Prerequisitos
- **Docker Desktop** (incluye Docker Compose)
- **Node.js** (versión 18+)
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd flamenco-sync-studio
```

2. **Configurar variables de entorno**
```bash
cp env.example .env
```

3. **Iniciar el sistema**

**Windows:**
```cmd
scripts\start-windows.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/*.sh
./scripts/start-linux.sh
```

4. **Acceder a la aplicación**
- **Aplicación Principal**: http://localhost:8080
- **Supabase Studio**: http://localhost:3000

## 📚 Documentación Completa

Para instrucciones detalladas de instalación y configuración, consulta:

- **[📖 Guía de Despliegue Completa](README-DESPLIEGUE.md)** - Instrucciones paso a paso para Windows, Linux y macOS
- **[🐳 Documentación Docker](README-Docker.md)** - Configuración avanzada de Docker
- **[🏠 Desarrollo Local](README-Local.md)** - Guía para desarrolladores

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de UI
- **React Router** - Navegación
- **React Hook Form** - Formularios
- **TanStack Query** - Gestión de estado del servidor

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos
- **Row Level Security (RLS)** - Seguridad de datos
- **Edge Functions** - Funciones serverless
- **Real-time subscriptions** - Actualizaciones en tiempo real

### DevOps
- **Docker & Docker Compose** - Containerización
- **Kong API Gateway** - Gateway de API
- **Git** - Control de versiones

## 🌐 URLs del Sistema

Una vez iniciado, el sistema estará disponible en:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación Principal** | http://localhost:8080 | Interfaz principal de usuario |
| **Supabase Studio** | http://localhost:3000 | Panel de administración de BD |
| **API Gateway** | http://localhost:8000 | Punto de entrada unificado |
| **PostgreSQL** | localhost:5432 | Base de datos directa |
| **Auth Service** | http://localhost:9999 | Servicio de autenticación |
| **Realtime** | ws://localhost:4000 | WebSocket para tiempo real |

## 👤 Usuarios de Prueba

Después de la instalación inicial:

- **Email**: admin@admin.com
- **Contraseña**: admin123
- **Rol**: Administrador

## 🔧 Scripts Disponibles

### Windows
- `scripts\start-windows.bat` - Iniciar sistema completo
- `scripts\stop-windows.bat` - Detener servicios
- `scripts\reset-windows.bat` - Reset completo (elimina datos)

### Linux/macOS
- `./scripts/start-linux.sh` - Iniciar sistema completo
- `./scripts/stop-docker.sh` - Detener servicios
- `./scripts/reset-docker.sh` - Reset completo (elimina datos)
- `./scripts/verify-system.sh` - Verificar sistema
- `./scripts/check-security.sh` - Verificar seguridad de claves

## 🗂️ Estructura del Proyecto

```
flamenco-sync-studio/
├── src/                    # Código fuente React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # Context providers
│   ├── integrations/      # Integraciones externas
│   └── lib/               # Utilidades
├── supabase/              # Configuración Supabase
│   ├── migrations/        # Migraciones de BD
│   └── functions/         # Edge Functions
├── scripts/               # Scripts de automatización
├── docker-compose.yml     # Configuración Docker
├── kong.yml              # Configuración API Gateway
└── docs/                 # Documentación
```

## 🚀 Despliegue en Producción

Para desplegar en producción, consulta la [Guía de Despliegue](README-DESPLIEGUE.md#-despliegue-en-producción) que incluye:

- Despliegue en Supabase Cloud
- Configuración de VPS
- Configuración de dominio y SSL
- Scripts de backup automático

## 🆘 Soporte y Ayuda

### Solución de Problemas Comunes

1. **Verificar sistema**: `./scripts/verify-system.sh`
2. **Ver logs**: `docker-compose logs`
3. **Reiniciar servicios**: `docker-compose restart`
4. **Reset completo**: `./scripts/reset-docker.sh` (¡elimina datos!)

### Obtener Ayuda

- 📖 Revisa la [documentación completa](README-DESPLIEGUE.md)
- 🐛 Reporta issues en el repositorio
- 💬 Consulta los logs del sistema

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta usando Flamenco Sync Studio! 🎭✨**
