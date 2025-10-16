#!/bin/bash

echo "🧪 PRUEBA DEL SISTEMA DE NOTIFICACIONES"
echo "========================================"

# Verificar que las tablas existen
echo "1. Verificando tablas de notificaciones..."
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
SELECT 'TABLAS DE NOTIFICACIONES:' as status;
SELECT tablename FROM pg_tables WHERE tablename LIKE 'notification_%' ORDER BY tablename;
"

echo ""
echo "2. Verificando configuración insertada..."
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
SELECT 'CONFIGURACIÓN ACTUAL:' as status;
SELECT service, provider, active, 
       CASE 
         WHEN service = 'email' THEN from_email
         WHEN service = 'sms' THEN from_phone
         WHEN service = 'whatsapp' THEN from_whatsapp
       END as contact_info
FROM notification_config 
ORDER BY service;
"

echo ""
echo "3. Verificando plantillas de notificación..."
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
SELECT 'PLANTILLAS DISPONIBLES:' as status;
SELECT event_type, 
       CASE WHEN email_template IS NOT NULL THEN '✅' ELSE '❌' END as email,
       CASE WHEN sms_template IS NOT NULL THEN '✅' ELSE '❌' END as sms,
       CASE WHEN whatsapp_template IS NOT NULL THEN '✅' ELSE '❌' END as whatsapp
FROM notification_templates 
ORDER BY event_type;
"

echo ""
echo "4. Verificando políticas RLS..."
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
SELECT 'POLÍTICAS RLS:' as status;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename LIKE 'notification_%' 
ORDER BY tablename, policyname;
"

echo ""
echo "5. Verificando usuarios admin..."
docker exec 9493c5c63cee_flamenco_db psql -U postgres -d postgres -c "
SELECT 'USUARIOS ADMIN:' as status;
SELECT u.email, ur.role 
FROM auth.users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE ur.role = 'admin';
"

echo ""
echo "✅ VERIFICACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "1. Abre la aplicación: http://localhost:5173"
echo "2. Haz login como admin@admin.com"
echo "3. Ve a Configuración → Notificaciones"
echo "4. Prueba enviar una notificación"
echo ""
echo "💡 Si sigue fallando:"
echo "• Verifica que estés logueado"
echo "• Refresca la página (F5)"
echo "• Revisa la consola del navegador"
