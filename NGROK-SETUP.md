# 🌐 Configuración de ngrok para Edge Functions

## 📋 **¿Qué es ngrok?**

ngrok es una herramienta que crea túneles seguros desde tu máquina local hacia internet, permitiendo que servicios externos (como Holded) puedan hacer webhooks a tu aplicación local.

## 🚀 **Configuración Rápida**

### **1. Instalar ngrok (ya hecho)**
```bash
# ngrok ya está instalado en el sistema
ngrok version
```

### **2. Configurar authtoken**
```bash
# Ejecutar script de configuración
./scripts/configure-ngrok.sh
```

### **3. Iniciar túnel**
```bash
# Opción 1: Modo interactivo
./scripts/start-ngrok.sh

# Opción 2: Modo background
./scripts/start-ngrok-background.sh
```

### **4. Detener túnel**
```bash
./scripts/stop-ngrok.sh
```

## 🔧 **Configuración Manual**

Si prefieres configurar ngrok manualmente:

```bash
# 1. Obtener authtoken desde https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken TU_AUTHTOKEN_AQUI

# 2. Iniciar túnel
ngrok http 54321

# 3. Copiar la URL HTTPS que aparece (ej: https://abc123.ngrok.io)
```

## 📡 **URLs de las Edge Functions**

Una vez que ngrok esté corriendo, tendrás estas URLs:

- **Holded Webhook**: `https://xxxxx.ngrok.io/functions/v1/holded-webhook`
- **Holded Sync**: `https://xxxxx.ngrok.io/functions/v1/holded-sync`
- **WooCommerce Sync**: `https://xxxxx.ngrok.io/functions/v1/woocommerce-sync`

## 🔗 **Configuración en Holded**

1. Ve a tu panel de Holded
2. Configuración > Webhooks
3. URL del webhook: `https://xxxxx.ngrok.io/functions/v1/holded-webhook`
4. Eventos a escuchar:
   - `invoice.created` - Nueva factura creada
   - `invoice.updated` - Factura actualizada
   - `invoice.paid` - Factura pagada
   - `contact.created` - Nuevo contacto creado
   - `contact.updated` - Contacto actualizado

## 🧪 **Probar el Sistema**

```bash
# Probar Edge Functions
node scripts/test-ngrok-functions.js

# Probar sistema de facturación
node scripts/test-facturacion-simple.js
```

## 📝 **Archivos Importantes**

- `scripts/configure-ngrok.sh` - Configurar authtoken
- `scripts/start-ngrok.sh` - Iniciar túnel interactivo
- `scripts/start-ngrok-background.sh` - Iniciar túnel en background
- `scripts/stop-ngrok.sh` - Detener túnel
- `scripts/test-ngrok-functions.js` - Probar Edge Functions
- `ngrok.log` - Log de ngrok (cuando corre en background)
- `ngrok.pid` - PID del proceso ngrok (cuando corre en background)

## ⚠️ **Notas Importantes**

1. **URLs temporales**: Las URLs de ngrok cambian cada vez que reinicias ngrok (a menos que tengas cuenta de pago)
2. **Límites gratuitos**: La cuenta gratuita de ngrok tiene límites de ancho de banda y conexiones simultáneas
3. **Seguridad**: ngrok es seguro, pero asegúrate de no exponer información sensible
4. **Persistencia**: Para desarrollo, considera usar una cuenta de pago de ngrok para URLs fijas

## 🆘 **Solución de Problemas**

### **Error: "authentication failed"**
```bash
# Reconfigurar authtoken
./scripts/configure-ngrok.sh
```

### **Error: "port already in use"**
```bash
# Detener ngrok anterior
./scripts/stop-ngrok.sh

# Iniciar nuevamente
./scripts/start-ngrok.sh
```

### **No se puede acceder a las Edge Functions**
1. Verificar que Supabase esté corriendo: `docker-compose ps`
2. Verificar que ngrok esté corriendo: `ps aux | grep ngrok`
3. Revisar el log: `tail -f ngrok.log`

## 🎯 **Próximos Pasos**

1. Configurar ngrok con tu authtoken
2. Iniciar el túnel
3. Configurar webhooks en Holded
4. Probar la sincronización de facturas
5. ¡Disfrutar del sistema completo! 🎉
