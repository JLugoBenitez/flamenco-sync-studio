# 🔐 Guía de Seguridad - Flamenco Sync Studio

## ⚠️ IMPORTANTE: Protección de Claves

Este documento explica cómo proteger las claves y datos sensibles del proyecto.

## 🚨 Archivos que NUNCA deben subirse a Git

### Variables de Entorno
- `.env` - Contiene todas las claves sensibles
- `.env.local`
- `.env.production`
- `.env.staging`

### Claves de API
- `api-keys.json`
- `secrets.json`
- `credentials.json`
- `*.key`
- `*.pem`
- `*.p12`

### Base de Datos
- `*.sql` - Dumps de base de datos
- `database-backup-*`
- `postgres_data/`
- `data/`

### Configuraciones Sensibles
- `production-config.json`
- `woocommerce-keys.json`
- `holded-api-key.txt`
- `jwt-secret.txt`

## 🔑 Claves Importantes del Proyecto

### Supabase
```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Base de Datos
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
POSTGRES_PASSWORD=postgres
```

### JWT
```env
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
```

### Integraciones
```env
WOOCOMMERCE_CONSUMER_KEY=tu_clave_woocommerce
WOOCOMMERCE_CONSUMER_SECRET=tu_secreto_woocommerce
HOLDED_API_KEY=tu_clave_holded
```

## 🛡️ Buenas Prácticas de Seguridad

### 1. Variables de Entorno
- ✅ Usar siempre variables de entorno para claves
- ❌ NUNCA hardcodear claves en el código
- ✅ Usar `.env.example` como plantilla
- ❌ NUNCA subir archivos `.env` reales

### 2. Claves de Desarrollo vs Producción
```env
# DESARROLLO (pueden ser públicas)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PRODUCCIÓN (MANTENER SECRETAS)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_real_de_produccion
```

### 3. Docker Compose
- ✅ Las claves de desarrollo en `docker-compose.yml` son seguras (son públicas)
- ❌ NUNCA poner claves de producción en `docker-compose.yml`
- ✅ Usar variables de entorno para producción

## 🔍 Verificación de Seguridad

### Antes de hacer commit:
```bash
# Verificar que no hay archivos sensibles
git status

# Verificar que .env no está en el staging
git diff --cached --name-only | grep -E "\.(env|key|pem|sql)$"

# Si encuentras archivos sensibles:
git reset HEAD archivo_sensible
git rm --cached archivo_sensible
```

### Verificar que el .gitignore funciona:
```bash
# Intentar agregar un archivo .env (debería fallar)
echo "test" > .env
git add .env
# Debería mostrar: "nothing added to commit"
```

## 🚨 Si accidentalmente subiste claves

### 1. Eliminar del historial de Git
```bash
# Eliminar archivo del historial
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (¡CUIDADO!)
git push origin --force --all
```

### 2. Rotar las claves
- Cambiar todas las claves en Supabase
- Actualizar variables de entorno
- Notificar al equipo

### 3. Revisar el repositorio
- Verificar que no hay claves en el historial
- Revisar todas las ramas
- Actualizar documentación

## 📋 Checklist de Seguridad

Antes de subir código:

- [ ] ✅ Archivo `.env` no está en el staging
- [ ] ✅ No hay claves hardcodeadas en el código
- [ ] ✅ Variables de entorno usan valores de desarrollo
- [ ] ✅ Archivos de backup no están incluidos
- [ ] ✅ Configuraciones de producción no están incluidas
- [ ] ✅ `.gitignore` está actualizado
- [ ] ✅ Documentación no contiene claves reales

## 🔧 Configuración Segura por Entorno

### Desarrollo Local
```env
# Usar claves de desarrollo (pueden ser públicas)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Staging
```env
# Usar proyecto de staging separado
VITE_SUPABASE_URL=https://tu-proyecto-staging.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=clave_de_staging
```

### Producción
```env
# Usar proyecto de producción (MANTENER SECRETO)
VITE_SUPABASE_URL=https://tu-proyecto-prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=clave_de_produccion_real
```

## 📞 Contacto de Seguridad

Si descubres una vulnerabilidad de seguridad:

1. **NO** crear un issue público
2. Contactar al administrador del proyecto
3. Proporcionar detalles específicos
4. Esperar confirmación antes de divulgar

## 📚 Recursos Adicionales

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Recuerda: La seguridad es responsabilidad de todos. ¡Protege tus claves! 🔐**
