# 🔧 Guía de Solución de Problemas

## 🚨 Problemas Comunes

### 1. Error "Could not find the function"
**Síntoma**: `Could not find the function public.fichar_entrada_mejorada in the schema cache`

**Solución**:
```bash
# Refrescar caché de PostgREST
docker-compose restart rest meta realtime

# O reiniciar todo
docker-compose down && docker-compose up -d
```

### 2. Error de conexión a la base de datos
**Síntoma**: `Connection refused` o `Database connection failed`

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
docker exec flamenco_db pg_isready -U postgres

# Si no responde, reiniciar
docker-compose restart db

# Esperar y verificar
sleep 10
docker exec flamenco_db pg_isready -U postgres
```

### 3. Error de permisos
**Síntoma**: `Permission denied` o `sudo: command not found`

**Solución**:
```bash
# Dar permisos a scripts
chmod +x *.sh

# Añadir usuario a grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión
logout
# Volver a entrar
```

### 4. Puerto ocupado
**Síntoma**: `Port 8080 is already in use` o `Address already in use`

**Solución**:
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :8080
sudo lsof -i :8000
sudo lsof -i :3004

# Matar proceso específico
sudo kill -9 PID_DEL_PROCESO

# O matar todos los procesos de la app
pkill -f "npm run dev"
pkill -f "node index.mjs"
```

### 5. Error "supabaseKey is required"
**Síntoma**: `supabaseKey is required` en consola del navegador

**Solución**:
```bash
# Verificar variables de entorno
cat .env | grep SUPABASE

# Si faltan, copiar desde env.example
cp env.example .env

# Reiniciar aplicación
./stop-app.sh
./start-app.sh
```

### 6. Error de relaciones de base de datos
**Síntoma**: `Could not find a relationship between 'facturas' and 'clientes'`

**Solución**:
```bash
# Refrescar caché de PostgREST
docker-compose restart rest meta realtime

# Verificar foreign keys
docker exec -it flamenco_db psql -U postgres -d postgres -c "
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('facturas', 'encargos', 'productos');
"
```

### 7. Error de autenticación
**Síntoma**: No puede iniciar sesión o "Invalid credentials"

**Solución**:
```bash
# Verificar que existe el usuario admin
docker exec -it flamenco_db psql -U postgres -d postgres -c "
SELECT email FROM auth.users WHERE email = 'admin@admin.com';
"

# Si no existe, crear usuario admin
docker exec -it flamenco_db psql -U postgres -d postgres -c "
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, role
) VALUES (
  'd177eae3-2a53-4a62-ba75-316c10b91e62',
  'admin@admin.com',
  crypt('admin123', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{\"provider\": \"email\", \"providers\": [\"email\"]}',
  '{}', true, 'authenticated'
) ON CONFLICT (id) DO NOTHING;
"
```

### 8. Error de Holded API
**Síntoma**: `Holded API error` o `API key not configured`

**Solución**:
```bash
# Verificar API key en base de datos
docker exec -it flamenco_db psql -U postgres -d postgres -c "
SELECT * FROM public.configuracion WHERE clave = 'holded_api_key';
"

# Si no existe, insertarla
docker exec -it flamenco_db psql -U postgres -d postgres -c "
INSERT INTO public.configuracion (clave, valor) 
VALUES ('holded_api_key', 'tu-clave-holded')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;
"
```

## 🔍 Diagnóstico Avanzado

### Verificar estado de todos los servicios
```bash
# Estado de Docker
docker-compose ps

# Estado de procesos
ps aux | grep -E "(node|npm)"

# Puertos en uso
sudo netstat -tulpn | grep -E ":(8080|8000|3004|5432)"

# Logs de Docker
docker-compose logs --tail=50

# Logs del sistema
sudo journalctl -u docker --tail=20
```

### Verificar conectividad
```bash
# Probar endpoints
curl -I http://localhost:8080
curl -I http://localhost:8000
curl -I http://localhost:3004

# Probar base de datos
docker exec flamenco_db psql -U postgres -d postgres -c "SELECT 1;"

# Probar API
curl http://localhost:8000/rest/v1/
```

### Verificar configuración
```bash
# Variables de entorno
cat .env

# Configuración de Docker
cat docker-compose.yml

# Configuración de Kong
cat kong-simple.yml
```

## 🛠️ Comandos de Reparación

### Reset completo
```bash
# Parar todo
./stop-app.sh
docker-compose down

# Limpiar volúmenes (¡CUIDADO! Esto borra datos)
docker-compose down -v

# Reconstruir
docker-compose up -d --build

# Restaurar datos básicos
./start-app.sh
```

### Reparar base de datos
```bash
# Backup antes de reparar
docker exec flamenco_db pg_dump -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Reparar permisos
docker exec flamenco_db psql -U postgres -d postgres -c "
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
"

# Refrescar caché
docker-compose restart rest meta realtime
```

### Reparar Edge Function
```bash
# Parar Edge Function
pkill -f "node index.mjs"

# Limpiar node_modules
cd edge-local
rm -rf node_modules package-lock.json
npm install

# Reiniciar
cd ..
./start-app.sh
```

## 📊 Monitoreo Continuo

### Script de verificación
```bash
#!/bin/bash
echo "=== Flamenco Sync Studio Health Check ==="

# Verificar Docker
echo "Docker Services:"
docker-compose ps

# Verificar puertos
echo -e "\nPuertos:"
netstat -tulpn | grep -E ":(8080|8000|3004|5432)" || echo "Algunos puertos no están en uso"

# Verificar procesos
echo -e "\nProcesos:"
ps aux | grep -E "(node|npm)" | grep -v grep || echo "No hay procesos Node.js corriendo"

# Verificar conectividad
echo -e "\nConectividad:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 && echo " - Frontend OK" || echo " - Frontend ERROR"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 && echo " - API OK" || echo " - API ERROR"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3004 && echo " - Edge Function OK" || echo " - Edge Function ERROR"

# Verificar base de datos
echo -e "\nBase de datos:"
docker exec flamenco_db pg_isready -U postgres && echo "PostgreSQL OK" || echo "PostgreSQL ERROR"
```

## 🆘 Contacto de Soporte

Si los problemas persisten:

1. **Recopilar información**:
   ```bash
   # Crear reporte de diagnóstico
   ./health-check.sh > diagnostic-report.txt
   docker-compose logs > docker-logs.txt
   ```

2. **Verificar logs**:
   - `docker-compose logs` - Logs de Docker
   - `tail -f edge-local/edge-function.log` - Logs de Edge Function
   - `tail -f frontend.log` - Logs de Frontend

3. **Crear issue** en GitHub con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Información del sistema

---

**💡 Tip**: Siempre haz backup antes de hacer cambios importantes en la base de datos.
