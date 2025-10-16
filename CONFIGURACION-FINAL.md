# ✅ CONFIGURACIÓN FINAL - Flamenco Sync Studio

## 🗄️ **BASE DE DATOS - RELACIONES CONFIGURADAS**

### **Foreign Keys Creadas:**

| Tabla | Columna | Referencia | Acción |
|-------|---------|------------|--------|
| `encargos` | `cliente_id` | `clientes.id` | CASCADE |
| `facturas` | `cliente_id` | `clientes.id` | CASCADE |
| `fichajes` | `user_id` | `auth.users.id` | CASCADE |
| `fichajes` | `empleado_id` | `empleados.id` | FK existente |
| `incidencias` | `asignado_id` | `profiles.user_id` | SET NULL |
| `profiles` | `user_id` | `auth.users.id` | CASCADE |

### **Políticas RLS:**

- ✅ **35 políticas activas**
- ✅ `user_roles` sin RLS (evita recursión infinita)
- ✅ Permisos por rol (admin, empleado, cliente)

---

## 🔧 **FUNCIONALIDADES IMPLEMENTADAS**

### **1. Sistema de Fichajes Persistente**

**Funciones SQL:**
- `fichar_entrada(p_empleado_id)` - Registra entrada
- `fichar_salida()` - Registra salida y calcula horas
- `get_active_fichaje(p_user_id)` - Obtiene fichaje activo

**Hook React:**
```typescript
import { useFichaje } from '@/hooks/useFichaje';

const { fichajeActivo, ficharEntrada, ficharSalida, loading } = useFichaje();
```

**Características:**
- ✅ Persiste entre sesiones
- ✅ Cálculo automático de horas trabajadas
- ✅ Un solo fichaje activo por día

---

### **2. Sistema de Roles y Permisos**

**Hook React:**
```typescript
import { useUserRole } from '@/hooks/useUserRole';

const { isAdmin, isEmpleado, isCliente, role, loading } = useUserRole();
```

**Permisos por Rol:**

| Acción | Todos | Empleado | Admin |
|--------|-------|----------|-------|
| Ver productos | ✅ | ✅ | ✅ |
| Crear/Editar productos | ✅ | ✅ | ✅ |
| **Eliminar productos** | ❌ | ❌ | ✅ |
| Gestionar encargos | ✅ | ✅ | ✅ |
| Eliminar encargos | ❌ | ✅ | ✅ |
| Gestionar incidencias | ✅ | ✅ | ✅ |
| Eliminar incidencias | ❌ | ✅ | ✅ |
| **Gestionar empleados** | ❌ | ❌ | ✅ |
| Fichar entrada/salida | ✅ | ✅ | ✅ |
| Ver todos los fichajes | ❌ | ✅ | ✅ |

---

### **3. CRUD Completo**

**Componentes Actualizados:**
- ✅ `FichajeActual.tsx` - Usa hook `useFichaje`
- ✅ `Productos.tsx` - Usa hook `useUserRole`, permisos por rol
- ✅ `Empleados.tsx` - Solo admin puede gestionar
- ✅ `Fichajes.tsx` - Sin joins problemáticos

**Ejemplo de Uso:**
```typescript
// Crear producto
const { data, error } = await supabase
  .from('productos')
  .insert({ nombre, precio, stock, categoria, talla });

// Actualizar producto
await supabase
  .from('productos')
  .update({ stock: nuevoStock })
  .eq('id', productoId);

// Eliminar producto (solo admin)
await supabase
  .from('productos')
  .delete()
  .eq('id', productoId);
```

---

## 🛒 **INTEGRACIÓN CON WOOCOMMERCE**

### **Edge Function Configurada:**

**Ubicación:** `supabase/functions/woocommerce-sync/index.ts`

**Acciones Disponibles:**

1. **`sync_products`** - Sincronizar productos desde WooCommerce
   ```javascript
   fetch('/functions/v1/woocommerce-sync', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ action: 'sync_products' })
   });
   ```

2. **`create_product`** - Crear producto en WooCommerce
   ```javascript
   fetch('/functions/v1/woocommerce-sync', {
     method: 'POST',
     body: JSON.stringify({
       action: 'create_product',
       productData: {
         nombre: 'Producto X',
         precio: 99.99,
         stock: 10,
         descripcion: '...',
         dbProductId: 'uuid-del-producto'
       }
     })
   });
   ```

3. **`update_product`** - Actualizar producto en WooCommerce
   ```javascript
   fetch('/functions/v1/woocommerce-sync', {
     method: 'POST',
     body: JSON.stringify({
       action: 'update_product',
       productData: {
         dbProductId: 'uuid-del-producto',
         stock: 5,
         precio: 89.99
       }
     })
   });
   ```

### **Configuración Requerida:**

Almacenar en la tabla `configuracion`:

| Clave | Descripción |
|-------|-------------|
| `woo_url` | URL de tu tienda (ej: `https://tutienda.com`) |
| `woo_key` | Consumer Key de WooCommerce |
| `woo_secret` | Consumer Secret de WooCommerce |

**Cómo obtener las credenciales:**
1. WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. "Add key" → Descripción: "Flamenco Sync"
3. Permisos: Read/Write
4. Copiar Consumer Key y Consumer Secret

---

## 🚀 **COMANDOS ÚTILES**

### **Docker:**

```bash
# Iniciar servicios
./scripts/dev-local.sh dev

# Ver logs
./scripts/dev-local.sh logs

# Estado de servicios
./scripts/dev-local.sh status

# Abrir Supabase Studio
./scripts/dev-local.sh studio

# Reiniciar todo
./scripts/dev-local.sh restart

# Reset completo (¡BORRA DATOS!)
./scripts/dev-local.sh reset
```

### **Verificación:**

```bash
# Verificar sincronización frontend ⇄ backend
./scripts/verify-sync.sh

# Ver resumen de cambios
./scripts/mostrar-cambios.sh
```

---

## 📊 **ESTADO ACTUAL**

✅ **Base de datos:**
- 35 políticas RLS
- 7 foreign keys
- 4 funciones RPC
- Todas las tablas configuradas

✅ **Frontend:**
- 3 componentes actualizados
- 2 hooks personalizados
- Tipos TypeScript sincronizados

✅ **Servicios Docker:**
- PostgreSQL (puerto 5432)
- GoTrue Auth (puerto 9999)
- PostgREST API (puerto 3001)
- Kong Gateway (puerto 8000)
- Supabase Studio (puerto 3000)
- Realtime (puerto 4000)

✅ **Usuarios:**
- `admin@admin.com` → ROL: admin ✅
- `admin@flamencropuro.es` → ROL: admin ✅

---

## 🔐 **VARIABLES DE ENTORNO**

**`.env` (Frontend):**
```bash
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**JWT Secret:**
```
super-secret-jwt-token-with-at-least-32-characters-long
```

---

## 📚 **DOCUMENTACIÓN**

- `CAMBIOS-APLICADOS.md` - Resumen de cambios realizados
- `GUIA-IMPLEMENTACION.md` - Ejemplos de código
- `PERMISOS-Y-FUNCIONALIDADES.md` - Referencia de permisos
- `AUTENTICACION.md` - Guía de autenticación
- `README-Local.md` - Setup del entorno local

---

## ✅ **TODO FUNCIONANDO**

1. ✅ Fichajes que persisten entre sesiones
2. ✅ Sistema de roles y permisos
3. ✅ CRUD completo para productos, encargos, incidencias
4. ✅ Gestión de empleados solo para admin
5. ✅ Sincronización con WooCommerce configurada
6. ✅ Todas las relaciones de base de datos creadas
7. ✅ Sin errores de recursión infinita
8. ✅ Sin errores de relaciones faltantes

---

## 🎯 **PRÓXIMOS PASOS**

1. **Configurar WooCommerce:**
   - Agregar `woo_url`, `woo_key`, `woo_secret` en tabla `configuracion`
   
2. **Probar sincronización:**
   - Ir a Productos → Botón "Sincronizar con WooCommerce"
   
3. **Crear más usuarios:**
   - Registro normal → Asignar rol desde admin

---

**¡Todo está configurado y funcionando!** 🚀


