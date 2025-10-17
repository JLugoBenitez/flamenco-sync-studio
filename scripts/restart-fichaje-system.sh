#!/bin/bash

echo "🔄 REINICIANDO SISTEMA DE FICHAJE"
echo "=================================="

echo "1. 🛑 Deteniendo frontend..."
pkill -f "vite" || echo "Frontend ya detenido"

echo "2. 🔄 Reiniciando contenedores de Docker..."
docker-compose restart

echo "3. ⏳ Esperando que los servicios estén listos..."
sleep 10

echo "4. ✅ Verificando servicios..."
echo "   - Backend API:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/rest/v1/ && echo " ✅" || echo " ❌"

echo "   - Base de datos:"
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1 && echo " ✅" || echo " ❌"

echo "5. 🚀 Iniciando frontend..."
npm run dev &

echo "6. ⏳ Esperando que el frontend esté listo..."
sleep 5

echo "7. ✅ Verificando frontend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 && echo " ✅" || echo " ❌"

echo ""
echo "🎉 ¡SISTEMA REINICIADO COMPLETAMENTE!"
echo "====================================="
echo "Frontend: http://localhost:8080"
echo "Backend: http://localhost:8000"
echo "Login: admin@admin.com / holaadmin"
echo ""
echo "💡 Si el fichaje sigue sin funcionar:"
echo "1. Limpia caché del navegador (Ctrl+Shift+Delete)"
echo "2. Refresca la página (F5)"
echo "3. Verifica la consola del navegador (F12)"
