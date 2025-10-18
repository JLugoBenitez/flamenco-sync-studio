# 🔐 GUÍA DE SEGURIDAD - FLAMENCO SYNC STUDIO

## ⚠️ **IMPORTANTE: CLAVES LIMPIADAS**

**TODAS LAS CLAVES HARDCODEADAS HAN SIDO ELIMINADAS** del código fuente y reemplazadas por variables de entorno.

---

## 🔑 **CLAVES QUE ESTABAN EXPUESTAS:**

### **1. SUPABASE KEYS:**
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

### **2. HOLDED API KEY:**
- **API Key**: `c0ec41e6ce3f1b0ff734b63c6edfee81`

### **3. CLAVES DE PRUEBA:**
- Twilio: `AC123456789:your_auth_token`
- Test API: `test-api-key-12345`

---

## 🛠️ **ARCHIVOS MODIFICADOS:**

### **✅ LIMPIADOS:**
- `kong.yml` - Claves reemplazadas por `${SUPABASE_ANON_KEY}` y `${SUPABASE_SERVICE_ROLE_KEY}`
- `kong-simple.yml` - Claves reemplazadas por variables de entorno
- `docker-compose.yml` - Service Role Key reemplazada por variable
- `test-sync.js` - Claves reemplazadas por variables de entorno
- `scripts/*` - Todas las claves hardcodeadas reemplazadas
- `start-*.sh` - Claves reemplazadas por variables de entorno

### **✅ CREADOS:**
- `.env` - Archivo con las claves reales (NO se sube a Git)
- `.env.example` - Plantilla para otros desarrolladores
- `setup-env.sh` - Script para configurar variables de entorno
- `clean-secrets.sh` - Script para limpiar claves expuestas

---

## 🔒 **CONFIGURACIÓN ACTUAL:**

### **Variables de Entorno (.env):**
```env
# Supabase
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Holded
HOLDED_API_KEY=c0ec41e6ce3f1b0ff734b63c6edfee81

# Database
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

---

## 🚀 **CÓMO USAR:**

### **1. Configurar variables de entorno:**
```bash
# Opción 1: Cargar automáticamente
source .env

# Opción 2: Usar el script
./setup-env.sh
```

### **2. Iniciar la aplicación:**
```bash
./start-app.sh
```

### **3. Verificar que funciona:**
- Frontend: http://localhost:8080
- Supabase: http://localhost:8000
- Edge Function: http://localhost:3004

---

## 🔐 **BEST PRACTICES DE SEGURIDAD:**

### **✅ HACER:**
- ✅ Usar variables de entorno para todas las claves
- ✅ Nunca subir `.env` a Git
- ✅ Usar `.env.example` como plantilla
- ✅ Rotar claves regularmente
- ✅ Usar claves diferentes para desarrollo/producción

### **❌ NO HACER:**
- ❌ Hardcodear claves en el código
- ❌ Subir archivos `.env` a Git
- ❌ Compartir claves por email/chat
- ❌ Usar claves de producción en desarrollo
- ❌ Dejar claves en logs o consola

---

## 🚨 **EN CASO DE COMPROMISO:**

### **1. Rotar claves inmediatamente:**
- Cambiar claves en Supabase Dashboard
- Cambiar claves en Holded Dashboard
- Actualizar archivo `.env`

### **2. Verificar logs:**
- Revisar logs de acceso
- Buscar actividad sospechosa
- Monitorear uso de API

### **3. Notificar al equipo:**
- Informar sobre el compromiso
- Coordinar rotación de claves
- Revisar políticas de seguridad

---

## 📋 **CHECKLIST DE SEGURIDAD:**

### **Antes de cada commit:**
- [ ] ¿Hay claves hardcodeadas en el código?
- [ ] ¿Está el archivo `.env` en `.gitignore`?
- [ ] ¿Se han usado variables de entorno?
- [ ] ¿Se han eliminado claves de prueba?

### **Antes de cada deploy:**
- [ ] ¿Las claves de producción son diferentes?
- [ ] ¿Se han configurado las variables de entorno?
- [ ] ¿Se ha verificado la configuración?
- [ ] ¿Se han probado las conexiones?

---

## 🎯 **PRÓXIMOS PASOS:**

1. **Configurar claves de producción** diferentes a las de desarrollo
2. **Implementar rotación automática** de claves
3. **Configurar monitoreo** de uso de API
4. **Implementar autenticación 2FA** para administradores
5. **Configurar alertas** de seguridad

---

## 📞 **CONTACTO:**

Si encuentras alguna clave expuesta o problema de seguridad:
1. **NO** subas el commit
2. **Ejecuta** `./clean-secrets.sh`
3. **Contacta** al administrador del proyecto
4. **Rota** las claves comprometidas

---

**🔒 RECUERDA: La seguridad es responsabilidad de todos. Mantén las claves seguras y nunca las expongas en el código.**
