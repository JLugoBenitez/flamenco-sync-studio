#!/bin/bash

# Script para detener ngrok
echo "🛑 DETENIENDO NGROK"
echo "==================="

# Verificar si hay un PID guardado
if [ -f ngrok.pid ]; then
    NGROK_PID=$(cat ngrok.pid)
    echo "Deteniendo ngrok con PID: $NGROK_PID"
    
    if kill $NGROK_PID 2>/dev/null; then
        echo "✅ Ngrok detenido correctamente"
    else
        echo "⚠️  No se pudo detener ngrok con el PID guardado"
    fi
    
    rm -f ngrok.pid
else
    echo "⚠️  No se encontró archivo de PID"
fi

# Detener cualquier proceso ngrok que esté corriendo
if pgrep -f "ngrok" > /dev/null; then
    echo "Deteniendo todos los procesos ngrok..."
    pkill -f "ngrok"
    sleep 2
    
    if pgrep -f "ngrok" > /dev/null; then
        echo "⚠️  Algunos procesos ngrok siguen corriendo"
    else
        echo "✅ Todos los procesos ngrok detenidos"
    fi
else
    echo "ℹ️  No hay procesos ngrok corriendo"
fi

# Limpiar archivos temporales
if [ -f ngrok.log ]; then
    echo "📝 Log guardado en: ngrok.log"
fi

echo "✅ Proceso completado"
