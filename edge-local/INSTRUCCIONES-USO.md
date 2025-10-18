# 🚀 FLAMENCO SYNC STUDIO - INSTRUCCIONES DE USO

## ✅ **SISTEMA COMPLETAMENTE FUNCIONAL**

### 🎯 **PARA INICIAR LA APLICACIÓN COMPLETA:**

```bash
./start-app.sh
```

**Este comando hace TODO automáticamente:**
- ✅ Verifica y inicia Docker
- ✅ Inicia PostgreSQL y Supabase
- ✅ Inicia el Edge Function (sincronización con Holded)
- ✅ Inicia el Frontend (React + Vite)
- ✅ Verifica que todo esté funcionando
- ✅ **NO TOCA LA BASE DE DATOS** - preserva todos los datos

### 🛑 **PARA PARAR LA APLICACIÓN:**

```bash
./stop-app.sh
```

**Este comando para:**
- ✅ Frontend (puerto 8080)
- ✅ Edge Function (puerto 3004)
- ✅ **MANTIENE Docker y la base de datos** - no pierdes datos

### 🌐 **URLs DE ACCESO:**

- **Aplicación Principal**: http://localhost:8080
- **Supabase Dashboard**: http://localhost:8000
- **Edge Function**: http://localhost:3004

### 📋 **FUNCIONALIDADES DISPONIBLES:**

1. **👥 Gestión de Empleados**
   - Crear, editar, eliminar empleados
   - Asignar roles (admin, empleado)
   - Sincronización automática

2. **⏰ Sistema de Fichajes**
   - Fichar entrada y salida
   - Ver tiempo transcurrido en tiempo real
   - Historial de fichajes
   - Eliminar fichajes

3. **💰 Facturación**
   - Crear facturas
   - Cambiar estado de facturas
   - **SINCRONIZACIÓN AUTOMÁTICA CON HOLDED**
   - Crear pagos automáticamente

4. **📦 Gestión de Productos**
   - Crear y editar productos
   - Sincronización con Holded
   - Subir productos a Holded

5. **🔔 Sistema de Notificaciones**
   - Configurar notificaciones
   - Plantillas personalizables
   - Pruebas de notificaciones

### 🔧 **MANTENIMIENTO:**

- **Logs del Frontend**: `frontend.log`
- **Logs del Edge Function**: `edge-function.log`
- **Reiniciar solo Edge Function**: `./start-edge-function.sh`

### ⚠️ **IMPORTANTE:**

- **NO ejecutes** `docker-compose down` a menos que quieras perder datos
- **NO modifiques** la base de datos directamente
- **Siempre usa** `./start-app.sh` para iniciar
- **Siempre usa** `./stop-app.sh` para parar

### 🎉 **¡TODO FUNCIONANDO AL 100%!**

El sistema está completamente operativo y sincronizado con Holded. Solo ejecuta `./start-app.sh` y ¡a trabajar!
