# 📚 Documentación de API - Flamenco Sync Studio

## 🌐 Endpoints Principales

### Base URLs
- **Frontend**: `http://localhost:8080`
- **API Backend**: `http://localhost:8000`
- **Edge Function**: `http://localhost:3004`

## 🔐 Autenticación

### Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "d177eae3-2a53-4a62-ba75-316c10b91e62",
    "email": "admin@admin.com"
  }
}
```

### Logout
```http
POST /auth/v1/logout
Authorization: Bearer <token>
```

## 👥 Gestión de Empleados

### Listar empleados
```http
GET /rest/v1/empleados
Authorization: Bearer <token>
```

### Crear empleado
```http
POST /rest/v1/empleados
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@empresa.com",
  "telefono": "123456789",
  "fecha_contratacion": "2024-01-15",
  "salario": 2500,
  "activo": true
}
```

### Actualizar empleado
```http
PATCH /rest/v1/empleados?id=eq.<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Pérez Actualizado",
  "salario": 3000
}
```

### Eliminar empleado
```http
DELETE /rest/v1/empleados?id=eq.<id>
Authorization: Bearer <token>
```

## ⏰ Sistema de Fichaje

### Fichar entrada
```http
POST /rest/v1/rpc/fichar_entrada_mejorada
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": "d177eae3-2a53-4a62-ba75-316c10b91e62"
}
```

### Fichar salida
```http
POST /rest/v1/rpc/fichar_salida_mejorada
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": "d177eae3-2a53-4a62-ba75-316c10b91e62"
}
```

### Obtener fichaje activo
```http
POST /rest/v1/rpc/get_fichaje_activo
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": "d177eae3-2a53-4a62-ba75-316c10b91e62"
}
```

### Obtener historial de fichajes
```http
POST /rest/v1/rpc/get_fichajes_usuario
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": "d177eae3-2a53-4a62-ba75-316c10b91e62"
}
```

## 📦 Gestión de Productos

### Listar productos
```http
GET /rest/v1/productos
Authorization: Bearer <token>
```

### Crear producto
```http
POST /rest/v1/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Producto Ejemplo",
  "descripcion": "Descripción del producto",
  "precio": 29.99,
  "stock": 100,
  "categoria": "General",
  "activo": true
}
```

### Actualizar producto
```http
PATCH /rest/v1/productos?id=eq.<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "precio": 35.99,
  "stock": 150
}
```

## 🛒 Gestión de Encargos

### Listar encargos
```http
GET /rest/v1/encargos
Authorization: Bearer <token>
```

### Crear encargo
```http
POST /rest/v1/encargos
Authorization: Bearer <token>
Content-Type: application/json

{
  "cliente_id": "uuid-del-cliente",
  "fecha_encargo": "2024-01-15",
  "fecha_entrega": "2024-01-20",
  "estado": "pendiente",
  "total": 150.00,
  "observaciones": "Encargo urgente"
}
```

### Actualizar estado de encargo
```http
PATCH /rest/v1/encargos?id=eq.<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "completado"
}
```

## 💰 Gestión de Facturas

### Listar facturas
```http
GET /rest/v1/facturas
Authorization: Bearer <token>
```

### Crear factura
```http
POST /rest/v1/facturas
Authorization: Bearer <token>
Content-Type: application/json

{
  "cliente_id": "uuid-del-cliente",
  "numero_factura": "FAC-2024-001",
  "fecha_factura": "2024-01-15",
  "fecha_vencimiento": "2024-02-15",
  "subtotal": 100.00,
  "iva": 21.00,
  "total": 121.00,
  "estado": "pendiente",
  "metodo_pago": "transferencia"
}
```

### Actualizar estado de factura
```http
PATCH /rest/v1/facturas?id=eq.<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "pagada"
}
```

## 🔗 Integración Holded

### Sincronizar factura con Holded
```http
POST /edge/holded-sync/sync-invoice
Authorization: Bearer <token>
Content-Type: application/json

{
  "factura_id": "uuid-de-la-factura"
}
```

### Obtener facturas de Holded
```http
GET /edge/holded-sync/invoices
Authorization: Bearer <token>
```

### Crear pago en Holded
```http
POST /edge/holded-sync/create-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "invoice_id": "holded-invoice-id",
  "amount": 121.00,
  "payment_method": "transfer"
}
```

## 🌐 Integración WooCommerce

### Sincronizar pedidos
```http
POST /edge/woocommerce-sync/sync-orders
Authorization: Bearer <token>
```

### Obtener productos de WooCommerce
```http
GET /edge/woocommerce-sync/products
Authorization: Bearer <token>
```

## 📊 Dashboard y Reportes

### Obtener métricas del dashboard
```http
POST /rest/v1/rpc/get_dashboard_metrics
Authorization: Bearer <token>
Content-Type: application/json

{
  "fecha_inicio": "2024-01-01",
  "fecha_fin": "2024-01-31"
}
```

### Obtener estadísticas de fichaje
```http
POST /rest/v1/rpc/get_fichaje_stats
Authorization: Bearer <token>
Content-Type: application/json

{
  "empleado_id": "uuid-del-empleado",
  "fecha_inicio": "2024-01-01",
  "fecha_fin": "2024-01-31"
}
```

## 🔔 Sistema de Notificaciones

### Enviar notificación
```http
POST /rest/v1/rpc/send_notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "email",
  "destinatario": "usuario@ejemplo.com",
  "asunto": "Notificación importante",
  "mensaje": "Contenido de la notificación"
}
```

### Obtener plantillas de notificación
```http
GET /rest/v1/notification_templates
Authorization: Bearer <token>
```

## 🛠️ Funciones RPC Personalizadas

### Obtener fichaje activo del usuario
```http
POST /rest/v1/rpc/get_fichaje_activo
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": "uuid-del-usuario"
}
```

### Obtener fichajes del usuario
```http
POST /rest/v1/rpc/get_fichajes_usuario
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": "uuid-del-usuario"
}
```

### Eliminar fichaje
```http
POST /rest/v1/rpc/eliminar_fichaje
Authorization: Bearer <token>
Content-Type: application/json

{
  "fichaje_id": "uuid-del-fichaje"
}
```

## 📝 Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Bad Request
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `422` - Error de validación
- `500` - Error interno del servidor

## 🔍 Filtros y Consultas

### Filtros básicos
```http
# Filtrar por campo
GET /rest/v1/empleados?activo=eq.true

# Ordenar
GET /rest/v1/empleados?order=nombre.asc

# Limitar resultados
GET /rest/v1/empleados?limit=10

# Paginación
GET /rest/v1/empleados?offset=0&limit=10
```

### Filtros avanzados
```http
# Múltiples condiciones
GET /rest/v1/empleados?activo=eq.true&salario=gte.2000

# Búsqueda de texto
GET /rest/v1/empleados?nombre=ilike.*juan*

# Fechas
GET /rest/v1/fichajes?fecha_entrada=gte.2024-01-01&fecha_entrada=lte.2024-01-31
```

### Selección de campos
```http
# Seleccionar campos específicos
GET /rest/v1/empleados?select=id,nombre,email

# Incluir relaciones
GET /rest/v1/facturas?select=*,clientes(*)
```

## 🔒 Seguridad

### Headers requeridos
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Rate Limiting
- **Límite**: 1000 requests por hora por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

### CORS
- **Orígenes permitidos**: `http://localhost:8080`, `http://localhost:3000`
- **Métodos**: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- **Headers**: `Authorization`, `Content-Type`

## 📋 Ejemplos de Uso

### Ejemplo completo: Crear empleado y fichar entrada
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' | jq -r .access_token)

# 2. Crear empleado
curl -X POST http://localhost:8000/rest/v1/empleados \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García",
    "email": "maria@empresa.com",
    "telefono": "987654321",
    "fecha_contratacion": "2024-01-15",
    "salario": 2800,
    "activo": true
  }'

# 3. Fichar entrada
curl -X POST http://localhost:8000/rest/v1/rpc/fichar_entrada_mejorada \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":"d177eae3-2a53-4a62-ba75-316c10b91e62"}'
```

---

**📖 Para más información, consulta la documentación completa en [README.md](README.md)**
