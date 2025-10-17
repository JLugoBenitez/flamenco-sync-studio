#!/bin/bash

echo "🧹 LIMPIANDO CACHÉ PARA ELIMINAR ERRORES DE WEBSOCKET"
echo "===================================================="

echo "1. 🛑 Deteniendo frontend..."
pkill -f "vite" || echo "Frontend ya detenido"

echo "2. 🗑️ Limpiando caché de Node.js..."
rm -rf node_modules/.vite
rm -rf .vite

echo "3. 🗑️ Limpiando caché del navegador (instrucciones)..."
echo ""
echo "📋 INSTRUCCIONES PARA LIMPIAR CACHÉ DEL NAVEGADOR:"
echo "=================================================="
echo ""
echo "Chrome/Edge:"
echo "1. Presiona Ctrl+Shift+Delete"
echo "2. Selecciona 'Caché' y 'Datos de aplicaciones web'"
echo "3. Haz clic en 'Eliminar datos'"
echo ""
echo "Firefox:"
echo "1. Presiona Ctrl+Shift+Delete"
echo "2. Selecciona 'Caché' y 'Datos de aplicaciones web'"
echo "3. Haz clic en 'Eliminar datos'"
echo ""
echo "Alternativa Universal:"
echo "1. Presiona F12"
echo "2. Haz clic derecho en el botón de recargar (🔄)"
echo "3. Selecciona 'Vaciar caché y recargar de forma forzada'"
echo ""

echo "4. ⏳ Esperando 3 segundos..."
sleep 3

echo "5. 🚀 Iniciando frontend con configuración limpia..."
npm run dev &

echo "6. ⏳ Esperando que el frontend esté listo..."
sleep 5

echo "7. ✅ Verificando frontend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 && echo " ✅ Frontend funcionando" || echo " ❌ Frontend no disponible"

echo ""
echo "🎉 ¡CACHÉ LIMPIADO COMPLETAMENTE!"
echo "================================="
echo "Frontend: http://localhost:8080"
echo ""
echo "💡 AHORA:"
echo "1. Limpia el caché del navegador (instrucciones arriba)"
echo "2. Ve a: http://localhost:8080"
echo "3. El error de WebSocket debería haber desaparecido"
echo "4. Prueba el fichaje en el Dashboard"
