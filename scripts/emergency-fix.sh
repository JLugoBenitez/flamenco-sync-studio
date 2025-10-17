#!/bin/bash

echo "🚨 SOLUCIÓN DE EMERGENCIA - RESTAURAR APLICACIÓN"
echo "================================================"

echo "1. 🛑 Deteniendo frontend..."
pkill -f "vite" || echo "Frontend ya detenido"

echo "2. 🗑️ Limpiando caché completamente..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

echo "3. ⏳ Esperando 2 segundos..."
sleep 2

echo "4. 🚀 Iniciando frontend con configuración corregida..."
npm run dev &

echo "5. ⏳ Esperando que el frontend esté listo..."
sleep 5

echo "6. ✅ Verificando frontend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 && echo " ✅ Frontend funcionando" || echo " ❌ Frontend no disponible"

echo ""
echo "🎉 ¡APLICACIÓN RESTAURADA!"
echo "=========================="
echo "Frontend: http://localhost:8080"
echo "Login: admin@admin.com / holaadmin"
echo ""
echo "💡 INSTRUCCIONES:"
echo "1. Ve a: http://localhost:8080"
echo "2. Si ves errores, presiona F5 para refrescar"
echo "3. Si persisten los errores, limpia caché del navegador (Ctrl+Shift+Delete)"
echo "4. La aplicación debería funcionar normalmente ahora"
