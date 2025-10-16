#!/bin/bash

# ===========================================
# Script para inicializar la base de datos con datos de prueba
# ===========================================

set -e

echo "🗄️ Inicializando base de datos con datos de prueba..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker exec flamenco_db pg_isready -U postgres; do
    echo "PostgreSQL no está listo aún..."
    sleep 2
done

echo "✅ PostgreSQL está listo!"

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker exec -i flamenco_db psql -U postgres -d postgres < ./supabase/migrations/20251013224340_b46517f0-92f8-4698-9fe1-f6497363778b.sql
docker exec -i flamenco_db psql -U postgres -d postgres < ./supabase/migrations/20251013224417_693a6224-f1dd-4157-974a-75118c6ddfb2.sql
docker exec -i flamenco_db psql -U postgres -d postgres < ./supabase/migrations/20251014230353_5ed71202-8136-491a-ab9e-8d0f36a4e72d.sql

echo "✅ Migraciones ejecutadas!"

# Crear usuario admin de prueba
echo "👤 Creando usuario admin de prueba..."
docker exec -i flamenco_db psql -U postgres -d postgres << EOF
-- Crear usuario admin en auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@flamencropuro.es',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"nombre": "Administrador"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Asignar rol de admin
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000000', 'admin');

-- Crear perfil
INSERT INTO public.profiles (id, user_id, nombre, email) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'Administrador',
    'admin@flamencropuro.es'
);
EOF

echo "✅ Usuario admin creado!"
echo ""
echo "👤 Credenciales de prueba:"
echo "   Email: admin@flamencropuro.es"
echo "   Contraseña: admin123"
echo ""
echo "🌐 Puedes acceder a Supabase Studio en: http://localhost:3000"
