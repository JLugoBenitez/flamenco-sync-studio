#!/usr/bin/env node

/**
 * Script para migrar datos a Supabase Cloud de Lovable
 * Específicamente diseñado para proyectos de Lovable
 */

import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import readline from 'readline';

// Configuración de la base de datos local
const LOCAL_DB_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
};

// Función para obtener credenciales del usuario
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

async function getLovableCredentials() {
    console.log('🔑 Configuración de credenciales de Lovable/Supabase Cloud');
    console.log('');
    console.log('💡 Puedes encontrar estas credenciales en:');
    console.log('   1. Tu dashboard de Lovable: https://lovable.dev/dashboard');
    console.log('   2. O en tu proyecto: Settings > Environment Variables');
    console.log('');

    const supabaseUrl = await askQuestion('🌐 SUPABASE_URL (ej: https://xxxxx.supabase.co): ');
    const supabaseAnonKey = await askQuestion('🔑 SUPABASE_ANON_KEY (clave pública): ');
    const supabaseServiceKey = await askQuestion('🔐 SUPABASE_SERVICE_KEY (clave de servicio): ');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.error('❌ Error: Todas las credenciales son requeridas');
        process.exit(1);
    }

    return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
}

async function migrateToLovable() {
    console.log('🚀 Iniciando migración a Lovable/Supabase Cloud...');
    
    // Obtener credenciales
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = await getLovableCredentials();
    
    // Crear cliente de Supabase con service key para migración
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
            console.log('💡 Verifica que las credenciales sean correctas y que el proyecto esté activo');
            process.exit(1);
        }
        
        console.log('✅ Conexión a Supabase Cloud exitosa');

        // Lista de tablas a migrar (en orden de dependencias)
        const tables = [
            'configuracion',
            'profiles', 
            'user_roles',
            'empleados',
            'productos',
            'clientes',
            'encargos',
            'fichajes',
            'incidencias',
            'facturas'
        ];

        console.log('\n📊 Resumen de migración:');
        
        // Primero, contar registros en cada tabla
        for (const tableName of tables) {
            try {
                const result = await localClient.query(`SELECT COUNT(*) FROM ${tableName}`);
                const count = parseInt(result.rows[0].count);
                console.log(`  📋 ${tableName}: ${count} registros`);
            } catch (error) {
                console.log(`  ❌ ${tableName}: Error contando registros - ${error.message}`);
            }
        }

        const confirm = await askQuestion('\n❓ ¿Continuar con la migración? (y/N): ');
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log('❌ Migración cancelada');
            process.exit(0);
        }

        // Migrar datos tabla por tabla
        console.log('\n🔄 Iniciando migración de datos...');

        for (const tableName of tables) {
            console.log(`\n📤 Migrando tabla: ${tableName}`);
            
            try {
                // Obtener datos de la tabla local
                const result = await localClient.query(`SELECT * FROM ${tableName} ORDER BY created_at ASC`);
                const data = result.rows;
                
                if (data.length === 0) {
                    console.log(`  ⚠️  Tabla ${tableName} está vacía, saltando...`);
                    continue;
                }

                console.log(`  📊 ${data.length} registros encontrados`);

                // Migrar en lotes de 50 registros (más conservador para Supabase)
                const batchSize = 50;
                let successCount = 0;
                let errorCount = 0;

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
                            console.error(`  ❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error.message);
                            errorCount += batch.length;
                            
                            // Intentar insertar uno por uno si falla el lote
                            console.log(`  🔄 Intentando inserción individual...`);
                            for (const record of batch) {
                                try {
                                    const { error: singleError } = await supabase
                                        .from(tableName)
                                        .upsert(record, { 
                                            onConflict: 'id',
                                            ignoreDuplicates: false 
                                        });
                                    
                                    if (singleError) {
                                        console.error(`    ❌ Error con registro ID ${record.id}:`, singleError.message);
                                        errorCount++;
                                    } else {
                                        successCount++;
                                    }
                                } catch (err) {
                                    console.error(`    ❌ Error crítico con registro ID ${record.id}:`, err.message);
                                    errorCount++;
                                }
                            }
                        } else {
                            successCount += batch.length;
                            console.log(`  ✅ Lote ${Math.floor(i/batchSize) + 1} migrado correctamente`);
                        }
                    } catch (err) {
                        console.error(`  ❌ Error crítico en lote ${Math.floor(i/batchSize) + 1}:`, err.message);
                        errorCount += batch.length;
                    }
                }

                console.log(`  📈 Resultado: ${successCount} exitosos, ${errorCount} errores`);

            } catch (error) {
                console.error(`  ❌ Error migrando tabla ${tableName}:`, error.message);
            }
        }

        // Verificar migración final
        console.log('\n🔍 Verificando migración final...');
        for (const tableName of tables) {
            try {
                const { count, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.log(`  ❌ Error verificando ${tableName}:`, error.message);
                } else {
                    console.log(`  ✅ ${tableName}: ${count} registros en Supabase Cloud`);
                }
            } catch (err) {
                console.log(`  ❌ Error verificando ${tableName}:`, err.message);
            }
        }

        // Crear archivo .env para el proyecto
        console.log('\n📝 Creando archivo .env para tu proyecto...');
        const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${supabaseAnonKey}

# Para desarrollo local (opcional)
# VITE_SUPABASE_URL=http://localhost:8000
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
`;

        fs.writeFileSync('.env', envContent);
        console.log('✅ Archivo .env creado');

        console.log('\n🎉 ¡Migración completada!');
        console.log('📝 Próximos pasos:');
        console.log('  1. Reinicia tu servidor de desarrollo: npm run dev');
        console.log('  2. Verifica que los datos aparezcan en tu aplicación');
        console.log('  3. Puedes acceder a Supabase Studio desde tu dashboard de Lovable');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await localClient.end();
    }
}

// Función para crear respaldo CSV
async function createBackup() {
    console.log('📦 Creando respaldo CSV...');
    
    const localClient = new Client(LOCAL_DB_CONFIG);
    await localClient.connect();

    const tables = [
        'configuracion', 'profiles', 'user_roles', 'empleados', 
        'productos', 'clientes', 'encargos', 'fichajes', 
        'incidencias', 'facturas'
    ];

    const backupDir = './backup-data';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    for (const tableName of tables) {
        try {
            const result = await localClient.query(`SELECT * FROM ${tableName} ORDER BY created_at ASC`);
            const data = result.rows;
            
            if (data.length > 0) {
                // Convertir a CSV
                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row => 
                        headers.map(header => {
                            const value = row[header];
                            if (value === null) return '';
                            if (typeof value === 'string' && value.includes(',')) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value;
                        }).join(',')
                    )
                ].join('\n');

                fs.writeFileSync(`${backupDir}/${tableName}.csv`, csvContent);
                console.log(`  ✅ ${tableName}.csv creado (${data.length} registros)`);
            }
        } catch (error) {
            console.error(`  ❌ Error creando ${tableName}.csv:`, error.message);
        }
    }

    await localClient.end();
    console.log(`\n📁 Archivos CSV guardados en: ${backupDir}`);
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    
    if (args.includes('--backup-only')) {
        createBackup();
    } else {
        migrateToLovable();
    }
}

export { migrateToLovable, createBackup };

