#!/usr/bin/env node

/**
 * Script para configurar la migración a Lovable/Supabase Cloud
 * Guía paso a paso para configurar tu proyecto
 */

import fs from 'fs';
import readline from 'readline';

// Función para hacer preguntas
function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function setupLovableMigration() {
    console.log('🚀 Configuración de migración a Lovable/Supabase Cloud');
    console.log('=====================================================');
    console.log('');

    // Verificar que el respaldo existe
    if (!fs.existsSync('./backup-data')) {
        console.log('❌ Error: No se encontró el directorio backup-data/');
        console.log('💡 Ejecuta primero: node scripts/backup-all-data.mjs');
        process.exit(1);
    }

    console.log('✅ Respaldo encontrado en backup-data/');
    console.log('');

    // Paso 1: Obtener credenciales de Lovable
    console.log('🔑 PASO 1: Obtener credenciales de Lovable');
    console.log('==========================================');
    console.log('');
    console.log('Para continuar, necesitas las credenciales de tu proyecto Lovable:');
    console.log('');
    console.log('1. 🌐 Ve a: https://lovable.dev/dashboard');
    console.log('2. 📁 Selecciona tu proyecto');
    console.log('3. ⚙️  Ve a Settings > Environment Variables');
    console.log('4. 📋 Copia estas variables:');
    console.log('   - SUPABASE_URL (ej: https://xxxxx.supabase.co)');
    console.log('   - SUPABASE_ANON_KEY (clave pública larga)');
    console.log('   - SUPABASE_SERVICE_KEY (clave de servicio)');
    console.log('');

    const continueSetup = await askQuestion('¿Tienes las credenciales listas? (y/N): ');
    if (continueSetup.toLowerCase() !== 'y' && continueSetup.toLowerCase() !== 'yes') {
        console.log('❌ Configuración cancelada');
        console.log('💡 Cuando tengas las credenciales, ejecuta este script nuevamente');
        process.exit(0);
    }

    console.log('');
    const supabaseUrl = await askQuestion('🌐 SUPABASE_URL: ');
    const supabaseAnonKey = await askQuestion('🔑 SUPABASE_ANON_KEY: ');
    const supabaseServiceKey = await askQuestion('🔐 SUPABASE_SERVICE_KEY: ');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.log('❌ Error: Todas las credenciales son requeridas');
        process.exit(1);
    }

    console.log('');
    console.log('✅ Credenciales recibidas');
    console.log('');

    // Paso 2: Crear archivo .env
    console.log('📝 PASO 2: Creando archivo .env');
    console.log('===============================');
    
    const envContent = `# Configuración para Lovable/Supabase Cloud
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${supabaseAnonKey}

# Para desarrollo local (opcional)
# VITE_SUPABASE_URL=http://localhost:8000
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env creado');
    console.log('');

    // Paso 3: Crear script de migración automática
    console.log('🤖 PASO 3: Creando script de migración automática');
    console.log('=================================================');

    const migrationScript = `#!/usr/bin/env node

/**
 * Script automático para migrar datos a Supabase Cloud
 * Usa las credenciales del archivo .env
 */

import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const LOCAL_DB_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
};

async function migrateToSupabase() {
    console.log('🚀 Iniciando migración automática a Supabase Cloud...');
    
    // Verificar variables de entorno
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
        console.error('❌ Error: Variables de entorno no configuradas');
        console.log('💡 Asegúrate de que el archivo .env existe y tiene las credenciales correctas');
        process.exit(1);
    }

    // Crear cliente de Supabase
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );

    // Conectar a la base de datos local
    const localClient = new Client(LOCAL_DB_CONFIG);
    await localClient.connect();
    console.log('✅ Conectado a la base de datos local');

    try {
        // Verificar conexión a Supabase
        console.log('🔍 Verificando conexión a Supabase Cloud...');
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Error conectando a Supabase:', error.message);
            console.log('💡 Verifica que las credenciales sean correctas');
            process.exit(1);
        }
        
        console.log('✅ Conexión a Supabase Cloud exitosa');

        // Lista de tablas a migrar
        const tables = [
            'profiles',
            'user_roles',
            'empleados',
            'productos',
            'clientes',
            'encargos',
            'fichajes',
            'incidencias',
            'facturas',
            'configuracion'
        ];

        console.log('\\n📊 Iniciando migración de datos...');

        for (const tableName of tables) {
            console.log(`\\n📤 Migrando tabla: \${tableName}`);
            
            try {
                // Obtener datos de la tabla local
                const result = await localClient.query(\`SELECT * FROM \${tableName} ORDER BY created_at ASC\`);
                const data = result.rows;
                
                if (data.length === 0) {
                    console.log(\`  ⚠️  Tabla \${tableName} está vacía, saltando...\`);
                    continue;
                }

                console.log(\`  📊 \${data.length} registros encontrados\`);

                // Migrar en lotes
                const batchSize = 50;
                let successCount = 0;

                for (let i = 0; i < data.length; i += batchSize) {
                    const batch = data.slice(i, i + batchSize);
                    
                    try {
                        const { error } = await supabase
                            .from(tableName)
                            .upsert(batch, { 
                                onConflict: 'id',
                                ignoreDuplicates: false 
                            });

                        if (error) {
                            console.error(\`  ❌ Error en lote \${Math.floor(i/batchSize) + 1}:\`, error.message);
                        } else {
                            successCount += batch.length;
                            console.log(\`  ✅ Lote \${Math.floor(i/batchSize) + 1} migrado\`);
                        }
                    } catch (err) {
                        console.error(\`  ❌ Error crítico en lote \${Math.floor(i/batchSize) + 1}:\`, err.message);
                    }
                }

                console.log(\`  📈 Resultado: \${successCount} registros migrados\`);

            } catch (error) {
                console.error(\`  ❌ Error migrando tabla \${tableName}:\`, error.message);
            }
        }

        console.log('\\n🎉 ¡Migración completada!');
        console.log('📝 Próximos pasos:');
        console.log('  1. Reinicia tu servidor: npm run dev');
        console.log('  2. Verifica que los datos aparezcan en tu aplicación');
        console.log('  3. Accede a Supabase Studio desde Lovable para ver los datos');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await localClient.end();
    }
}

// Ejecutar migración
if (import.meta.url === \`file://\${process.argv[1]}\`) {
    migrateToSupabase();
}

export { migrateToSupabase };
`;

    fs.writeFileSync('scripts/migrate-to-supabase-auto.mjs', migrationScript);
    console.log('✅ Script de migración automática creado');
    console.log('');

    // Paso 4: Instalar dependencias necesarias
    console.log('📦 PASO 4: Instalando dependencias necesarias');
    console.log('=============================================');

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Agregar dotenv si no existe
    if (!packageJson.dependencies.dotenv) {
        packageJson.dependencies.dotenv = '^16.0.0';
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ dotenv agregado a package.json');
    }

    console.log('');

    // Paso 5: Resumen final
    console.log('🎯 CONFIGURACIÓN COMPLETADA');
    console.log('============================');
    console.log('');
    console.log('✅ Archivos creados:');
    console.log('  📄 .env - Configuración de credenciales');
    console.log('  🤖 scripts/migrate-to-supabase-auto.mjs - Script de migración');
    console.log('  📁 backup-data/ - Respaldo de datos');
    console.log('');
    console.log('🚀 Para migrar los datos, ejecuta:');
    console.log('   npm install  # Instalar dependencias');
    console.log('   node scripts/migrate-to-supabase-auto.mjs  # Migrar datos');
    console.log('');
    console.log('🔄 Para cambiar entre local y cloud:');
    console.log('   - Comenta/descomenta las líneas en .env');
    console.log('   - Reinicia tu servidor: npm run dev');
    console.log('');
    console.log('💡 Para ver los datos en Supabase Studio:');
    console.log('   - Ve a tu dashboard de Lovable');
    console.log('   - Abre Supabase Studio');
    console.log('   - Ve a Table Editor para ver los datos migrados');
}

// Ejecutar configuración
if (import.meta.url === `file://${process.argv[1]}`) {
    setupLovableMigration();
}

export { setupLovableMigration };

