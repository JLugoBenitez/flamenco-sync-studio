# 🔐 Guía de Autenticación - Flamenco Sync Studio

## ✅ Estado Actual

Tu sistema de autenticación está **completamente configurado y funcionando**. Ahora puedes:

- ✅ Registrar nuevos usuarios desde la aplicación
- ✅ Iniciar sesión con email y contraseña
- ✅ Crear usuarios con rol de administrador
- ✅ Gestionar perfiles de usuario

## 🚀 Cómo Registrarte desde la Aplicación

### Opción 1: Desde tu interfaz de Login/Registro

1. **Abre tu aplicación**: http://localhost:5173 (o el puerto que uses)
2. **Ve a la página de registro** (Sign Up)
3. **Completa el formulario**:
   - Email: `admin@flamencropuro.es`
   - Contraseña: (la que prefieras)
4. **Haz clic en "Registrarse"**

La aplicación usará automáticamente la configuración del archivo `.env`:
```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Opción 2: Prueba manual con curl

Para verificar que funciona, puedes probar el registro directamente:

```bash
curl -X POST http://localhost:8000/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -d '{
    "email": "admin@flamencropuro.es",
    "password": "tu-password-segura",
    "data": {
      "nombre": "Administrador",
      "role": "admin"
    }
  }'
```

## 👤 Configurar el Usuario como Administrador

Una vez registrado, el sistema automáticamente:

1. ✅ Crea el usuario en `auth.users`
2. ✅ Crea el perfil en `profiles` (gracias al trigger `on_auth_user_created`)
3. ✅ Asigna el rol en `user_roles`

### Verificar tu usuario

```bash
# Ver usuarios creados
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT id, email, created_at FROM auth.users;"

# Ver perfiles
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT * FROM profiles;"

# Ver roles
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT * FROM user_roles;"
```

### Actualizar rol a administrador (si es necesario)

Si el rol no se asignó automáticamente, puedes hacerlo manualmente:

```bash
# Primero, obtén el ID del usuario
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT id, email FROM auth.users WHERE email = 'admin@flamencropuro.es';"

# Luego, actualiza o inserta el rol
docker exec flamenco_db psql -U postgres -d postgres -c "
INSERT INTO user_roles (user_id, role) 
VALUES ('[tu-user-id-aqui]', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
"
```

## 🔑 URLs de Autenticación

- **Health Check**: http://localhost:8000/auth/v1/health
- **Signup**: http://localhost:8000/auth/v1/signup
- **Login**: http://localhost:8000/auth/v1/token?grant_type=password
- **User Info**: http://localhost:8000/auth/v1/user

## 🎯 Probar el Login

### Desde tu aplicación:

1. Ve a la página de login
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"

### Con curl:

```bash
curl -X POST http://localhost:8000/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -d '{
    "email": "admin@flamencropuro.es",
    "password": "tu-password"
  }'
```

## 🛠️ Configuración Actual

Tu sistema está configurado con:

- ✅ **Registro habilitado**: `GOTRUE_DISABLE_SIGNUP: false`
- ✅ **Auto-confirmación**: `GOTRUE_MAILER_AUTOCONFIRM: true` (no necesitas confirmar email)
- ✅ **URL del sitio**: `http://localhost:3000`
- ✅ **URLs permitidas**: `*` (todas)

## 📊 Gestión de Usuarios desde Supabase Studio

1. Abre Supabase Studio: http://localhost:3000
2. Ve a **Authentication** > **Users**
3. Aquí puedes:
   - Ver todos los usuarios
   - Crear nuevos usuarios manualmente
   - Editar usuarios existentes
   - Eliminar usuarios

## 🔍 Verificar Tablas de Autenticación

```bash
# Ver todas las tablas de auth
docker exec flamenco_db psql -U postgres -d postgres -c "\dt auth.*"

# Ver usuarios
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT id, email, created_at, email_confirmed_at FROM auth.users;"

# Ver identidades
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT * FROM auth.identities;"

# Ver sesiones activas
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT * FROM auth.sessions;"
```

## 🚨 Solución de Problemas

### Error: "Email already exists"
El usuario ya está registrado. Usa la función de login en lugar de registro.

### Error: "Invalid email or password"
Verifica que el email y contraseña sean correctos.

### Error: "User not confirmed"
Si `GOTRUE_MAILER_AUTOCONFIRM` no está en `true`, necesitas confirmar el email manualmente:

```bash
docker exec flamenco_db psql -U postgres -d postgres -c "
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@flamencropuro.es';
"
```

### No aparece el usuario en la aplicación
Verifica que el trigger `on_auth_user_created` esté funcionando:

```bash
docker exec flamenco_db psql -U postgres -d postgres -c "\df handle_new_user"
```

## 📝 Roles Disponibles

Tu sistema tiene 3 roles configurados:

- **`admin`**: Acceso completo al sistema
- **`empleado`**: Acceso para empleados
- **`cliente`**: Acceso para clientes

El rol se define en la tabla `user_roles` y se puede verificar con la función `has_role`.

## 🎉 ¡Listo!

Ahora puedes:

1. 🔐 **Registrarte** desde tu aplicación
2. 🔑 **Iniciar sesión** con tus credenciales
3. 👤 **Gestionar usuarios** desde Supabase Studio
4. 🛡️ **Asignar roles** según sea necesario

**¡Tu sistema de autenticación está completamente funcional!** 🚀

