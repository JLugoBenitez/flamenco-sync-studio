# 🔍 **VERIFICACIÓN DEL FICHAJE EN FRONTEND**

## **Pasos para diagnosticar el problema:**

### **1. Limpiar caché del navegador:**
```bash
# Presiona Ctrl+Shift+Delete
# Selecciona "Caché" y "Datos de aplicaciones web"
# Haz clic en "Eliminar datos"
# O presiona F12 → Red → Haz clic derecho en cualquier request → "Limpiar caché"
```

### **2. Verificar que estés logueado:**
1. Ve a: http://localhost:8080
2. Si no estás logueado, haz login con:
   - Email: admin@admin.com
   - Password: holaadmin

### **3. Abrir consola del navegador:**
1. Presiona F12
2. Ve a la pestaña "Console"
3. Busca errores relacionados con:
   - `fichar_entrada`
   - `fichar_salida`
   - `get_active_fichaje`
   - `useFichaje`

### **4. Probar el fichaje:**
1. Ve a la página principal (Dashboard)
2. Busca el componente "Control de Jornada"
3. Haz clic en "Fichar Entrada" o "Fichar Salida"
4. Observa si aparecen errores en la consola

### **5. Verificar el estado del fichaje:**
1. En la consola, escribe:
```javascript
// Verificar usuario logueado
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuario:', user);

// Verificar fichaje activo
const { data: fichaje } = await supabase.rpc('get_active_fichaje');
console.log('Fichaje activo:', fichaje);
```

## **Posibles problemas y soluciones:**

### **Problema 1: Usuario no autenticado**
- **Síntoma**: Error "No hay usuario autenticado"
- **Solución**: Hacer login nuevamente

### **Problema 2: Error de CORS**
- **Síntoma**: Error de CORS en la consola
- **Solución**: Limpiar caché del navegador

### **Problema 3: Error de red**
- **Síntoma**: Error de conexión a localhost:8000
- **Solución**: Verificar que Docker esté corriendo

### **Problema 4: Hook no actualiza estado**
- **Síntoma**: Los botones no cambian después de fichar
- **Solución**: Refrescar la página (F5)

## **Comandos de verificación:**

```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/rest/v1/

# Verificar que el frontend esté corriendo
curl http://localhost:8080

# Verificar fichajes en la base de datos
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "SELECT * FROM fichajes ORDER BY fecha_entrada DESC LIMIT 5;"
```

## **Si el problema persiste:**

1. **Reiniciar el frontend:**
   ```bash
   # En la terminal donde corre npm run dev
   # Presiona Ctrl+C
   # Luego ejecuta: npm run dev
   ```

2. **Reiniciar el backend:**
   ```bash
   docker-compose restart
   ```

3. **Verificar logs:**
   ```bash
   # Logs del frontend: En la terminal de npm run dev
   # Logs del backend: docker logs flamenco_rest
   ```
