# Sistema de Notificaciones - Configuración

## 🚀 **Servicios Integrados**

### **1. Email - Resend**
- **Proveedor**: Resend (moderno, confiable)
- **Registro**: https://resend.com
- **Precio**: 3,000 emails gratis/mes, luego $20/mes por 50,000 emails

**Configuración:**
```bash
# En tu .env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@tudominio.com
```

### **2. SMS - Twilio**
- **Proveedor**: Twilio (estándar de la industria)
- **Registro**: https://twilio.com
- **Precio**: $0.0075 por SMS en España

**Configuración:**
```bash
# En tu .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_PHONE=+1234567890
```

### **3. WhatsApp - Twilio**
- **Proveedor**: Twilio WhatsApp API (oficial)
- **Registro**: https://twilio.com/whatsapp
- **Precio**: $0.005 por mensaje

**Configuración:**
```bash
# En tu .env
TWILIO_WHATSAPP_FROM=+14155238886
```

## 📋 **Funcionalidades Implementadas**

### **✅ Triggers Automáticos:**
- **Encargos listos**: Notifica a clientes y admins
- **Stock bajo**: Alerta a admins cuando stock ≤ 3
- **Incidencias nuevas**: Notifica a admins

### **✅ Plantillas Personalizables:**
- Templates para cada tipo de notificación
- Variables dinámicas ({{cliente_nombre}}, {{encargo_id}}, etc.)
- Soporte para HTML en emails

### **✅ Preferencias de Usuario:**
- Cada usuario puede elegir qué notificaciones recibir
- Configuración por canal (email, SMS, WhatsApp)
- Configuración persistente en base de datos

### **✅ Historial de Notificaciones:**
- Log completo de todas las notificaciones enviadas
- Estados: pending, sent, failed, delivered
- IDs de servicios externos para tracking

## 🛠️ **Configuración Paso a Paso**

### **1. Configurar Email (Resend):**

1. **Registrarse en Resend:**
   ```bash
   # Ir a https://resend.com
   # Crear cuenta
   # Verificar dominio
   ```

2. **Obtener API Key:**
   ```bash
   # En dashboard de Resend
   # Crear API Key
   # Copiar clave
   ```

3. **Configurar en la app:**
   ```sql
   -- En Supabase SQL Editor
   INSERT INTO notification_config (service, provider, api_key, from_email, active) 
   VALUES ('email', 'resend', 'tu_api_key', 'noreply@tudominio.com', true);
   ```

### **2. Configurar SMS (Twilio):**

1. **Registrarse en Twilio:**
   ```bash
   # Ir a https://twilio.com
   # Crear cuenta
   # Verificar teléfono
   ```

2. **Obtener credenciales:**
   ```bash
   # Account SID y Auth Token en dashboard
   # Comprar número de teléfono
   ```

3. **Configurar en la app:**
   ```sql
   INSERT INTO notification_config (service, provider, api_key, api_secret, from_phone, active) 
   VALUES ('sms', 'twilio', 'tu_account_sid', 'tu_auth_token', '+1234567890', true);
   ```

### **3. Configurar WhatsApp (Twilio):**

1. **Configurar WhatsApp Business:**
   ```bash
   # En Twilio Console
   # Messaging > Try it out > Send a WhatsApp message
   # Siguir el proceso de verificación
   ```

2. **Configurar en la app:**
   ```sql
   INSERT INTO notification_config (service, provider, api_key, api_secret, from_whatsapp, active) 
   VALUES ('whatsapp', 'twilio', 'tu_account_sid', 'tu_auth_token', '+14155238886', true);
   ```

## 🎯 **Casos de Uso**

### **Encargo Listo:**
- **Email al cliente**: "Tu encargo #123 está listo"
- **SMS al cliente**: "¡Tu encargo #123 está listo! Total: 150€"
- **WhatsApp al cliente**: "¡Hola Juan! 👋 Tu encargo #123 está listo para recoger..."
- **Email al admin**: Notificación para seguimiento

### **Stock Bajo:**
- **Email al admin**: "Alerta: Stock bajo en Camiseta Flamenca"
- **SMS al admin**: "Alerta: Camiseta Flamenca tiene stock bajo (2)"

### **Incidencia Nueva:**
- **Email al admin**: "Nueva incidencia reportada por María García"
- **SMS al admin**: "Nueva incidencia: María García - Retraso"

## 🔧 **Personalización**

### **Modificar Plantillas:**
```sql
-- Ejemplo: Cambiar plantilla de encargo listo
UPDATE notification_templates 
SET content = '¡Tu pedido #{{encargo_id}} está listo! 🎉'
WHERE type = 'encargo_listo' AND channel = 'whatsapp';
```

### **Agregar Nuevas Variables:**
```sql
-- Agregar variable {{tienda_nombre}} a todas las plantillas
UPDATE notification_templates 
SET variables = array_append(variables, 'tienda_nombre')
WHERE active = true;
```

## 📊 **Monitoreo**

### **Ver Historial:**
```sql
-- Últimas 50 notificaciones
SELECT * FROM notification_log 
ORDER BY created_at DESC 
LIMIT 50;
```

### **Estadísticas por Canal:**
```sql
-- Notificaciones por canal
SELECT channel, status, COUNT(*) 
FROM notification_log 
GROUP BY channel, status;
```

## 🚨 **Troubleshooting**

### **Email no se envía:**
1. Verificar API Key de Resend
2. Verificar dominio verificado
3. Revisar logs en Resend dashboard

### **SMS no se envía:**
1. Verificar credenciales de Twilio
2. Verificar saldo en cuenta Twilio
3. Verificar formato del número (+34612345678)

### **WhatsApp no se envía:**
1. Verificar configuración de WhatsApp Business
2. Verificar número en formato internacional
3. Verificar aprobación de plantillas

## 💰 **Costos Estimados**

### **Para 1000 notificaciones/mes:**
- **Email**: Gratis (Resend free tier)
- **SMS**: ~$7.50 (1000 × $0.0075)
- **WhatsApp**: ~$5.00 (1000 × $0.005)

### **Para 10,000 notificaciones/mes:**
- **Email**: $20 (Resend paid plan)
- **SMS**: ~$75
- **WhatsApp**: ~$50

**Total estimado: ~$145/mes para 10,000 notificaciones**
