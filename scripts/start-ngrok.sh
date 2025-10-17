#!/bin/bash

# Script para iniciar ngrok con Supabase
echo "🚀 INICIANDO NGROK CON SUPABASE"
echo "==============================="

# Verificar que Supabase esté corriendo
if ! curl -s http://localhost:54321/health > /dev/null 2>&1; then
    echo "❌ Supabase no está corriendo. Por favor, inicia el proyecto primero."
    echo "   Ejecuta: docker-compose up -d"
    exit 1
fi

# Verificar si ya hay un túnel ngrok corriendo
if pgrep -f "ngrok" > /dev/null; then
    echo "⚠️  Ya hay un túnel ngrok corriendo."
    echo "   Deteniendo túnel anterior..."
    pkill -f "ngrok"
    sleep 2
fi

echo "🌐 Iniciando túnel ngrok..."
echo "   Puerto: 54321 (Supabase Edge Functions)"
echo "   Presiona Ctrl+C para detener"
echo ""

# Iniciar ngrok
ngrok http 54321 --log=stdout
