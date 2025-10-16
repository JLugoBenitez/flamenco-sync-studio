#!/usr/bin/env node

/**
 * Script avanzado para migrar datos a Supabase Cloud
 * Usa la API de Supabase directamente para una migración más eficiente
 */

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración
const LOCAL_DB_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
};

// Verificar variables de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Necesitas configurar las variables de entorno:');
    console.error('   export SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.error('   export SUPABASE_SERVICE_KEY=tu-service-role-key');
    console.error('');
    console.error('💡 Obtén estas credenciales desde:');
    console.error('   https://supabase.com/dashboard/project/tu-proyecto/settings/api');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function migrateData() {
    console.log('🚀 Iniciando migración avanzada a Supabase Cloud...');
    
    // Conectar a la base de datos local
    const localClient = new Client(LOCAL_DB_CONFIG);
    await localClient.connect();
    console.log('✅ Conectado a la base de datos local');

    try {
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

        for (const tableName of tables) {
            console.log(`\n📤 Migrando tabla: ${tableName}`);
            
            // Obtener datos de la tabla local
            const result = await localClient.query(`SELECT * FROM ${tableName} ORDER BY created_at ASC`);
            const data = result.rows;
            
            if (data.length === 0) {
                console.log(`  ⚠️  Tabla ${tableName} está vacía, saltando...`);
                continue;
            }

            console.log(`  📊 ${data.length} registros encontrados`);

            // Migrar en lotes de 100 registros
            const batchSize = 100;
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
                                }
                            } catch (err) {
                                console.error(`    ❌ Error crítico con registro ID ${record.id}:`, err.message);
                            }
                        }
                    } else {
                        console.log(`  ✅ Lote ${Math.floor(i/batchSize) + 1} migrado correctamente`);
                    }
                } catch (err) {
                    console.error(`  ❌ Error crítico en lote ${Math.floor(i/batchSize) + 1}:`, err.message);
                }
            }

            console.log(`  ✅ Tabla ${tableName} migrada completamente`);
        }

        // Verificar migración
        console.log('\n🔍 Verificando migración...');
        for (const tableName of tables) {
            try {
                const { count, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.log(`  ❌ Error verificando ${tableName}:`, error.message);
                } else {
                    console.log(`  ✅ ${tableName}: ${count} registros en Supabase`);
                }
            } catch (err) {
                console.log(`  ❌ Error verificando ${tableName}:`, err.message);
            }
        }

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await localClient.end();
        console.log('\n✅ Migración completada');
    }
}

// Función para crear archivos CSV como respaldo
async function createCSVBackup() {
    console.log('\n📦 Creando archivos CSV de respaldo...');
    
    const localClient = new Client(LOCAL_DB_CONFIG);
    await localClient.connect();

    const tables = [
        'configuracion', 'profiles', 'user_roles', 'empleados', 
        'productos', 'clientes', 'encargos', 'fichajes', 
        'incidencias', 'facturas'
    ];

    const backupDir = '/tmp/supabase-migration-backup';
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

// Ejecutar migración
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--backup-only')) {
        createCSVBackup();
    } else if (args.includes('--migrate-only')) {
        migrateData();
    } else {
        console.log('🚀 Iniciando migración completa...');
        migrateData().then(() => {
            console.log('\n📦 Creando respaldo CSV...');
            return createCSVBackup();
        }).catch(console.error);
    }
}

module.exports = { migrateData, createCSVBackup };

