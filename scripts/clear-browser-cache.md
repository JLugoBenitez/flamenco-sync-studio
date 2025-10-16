# 🧹 **LIMPIAR CACHÉ DEL NAVEGADOR**

## **Para eliminar el error de WebSocket:**

### **Chrome/Edge:**
1. Presiona `F12` para abrir DevTools
2. Haz clic derecho en el botón de recargar (🔄)
3. Selecciona **"Vaciar caché y recargar de forma forzada"**

### **Firefox:**
1. Presiona `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac)
2. O presiona `F12` → Red → Haz clic derecho en cualquier request → "Limpiar caché"

### **Alternativa Universal:**
1. Presiona `Ctrl + Shift + Delete` (o `Cmd + Shift + Delete` en Mac)
2. Selecciona "Caché" y "Datos de aplicaciones web"
3. Haz clic en "Eliminar datos"

## **Verificar que funciona:**
1. Después de limpiar caché, ve a: http://localhost:8080
2. Abre DevTools (F12) → Console
3. No deberías ver más errores de WebSocket
4. Ve a Configuración → Notificaciones → Pruebas
5. Prueba enviar un email

## **Si sigue apareciendo WebSocket:**
1. Cierra completamente el navegador
2. Ábrelo de nuevo
3. Ve directamente a: http://localhost:8080
