#!/usr/bin/env node

/**
 * Script para crear respaldo completo de todos los datos
 * Maneja diferentes estructuras de tablas automáticamente
 */

import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

// Configuración de la base de datos local
const LOCAL_DB_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
};

async function backupAllData() {
    console.log('📦 Creando respaldo completo de todos los datos...');
    
    const localClient = new Client(LOCAL_DB_CONFIG);
    await localClient.connect();
    console.log('✅ Conectado a la base de datos local');

    // Crear directorio de respaldo
    const backupDir = './backup-data';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
        // Obtener lista de todas las tablas
        const tablesResult = await localClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name NOT LIKE 'pg_%'
            AND table_name NOT LIKE 'sql_%'
            ORDER BY table_name
        `);

        const tables = tablesResult.rows.map(row => row.table_name);
        console.log(`📋 Encontradas ${tables.length} tablas: ${tables.join(', ')}`);

        let totalRecords = 0;
        const results = [];

        for (const tableName of tables) {
            console.log(`\n📤 Exportando tabla: ${tableName}`);
            
            try {
                // Obtener estructura de la tabla
                const structureResult = await localClient.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = '${tableName}' 
                    AND table_schema = 'public'
                    ORDER BY ordinal_position
                `);

                const columns = structureResult.rows.map(row => row.column_name);
                console.log(`  📊 Columnas: ${columns.join(', ')}`);

                // Determinar columna de ordenamiento
                let orderBy = '';
                if (columns.includes('created_at')) {
                    orderBy = 'ORDER BY created_at ASC';
                } else if (columns.includes('fecha_creacion')) {
                    orderBy = 'ORDER BY fecha_creacion ASC';
                } else if (columns.includes('id')) {
                    orderBy = 'ORDER BY id ASC';
                }

                // Exportar datos
                const dataResult = await localClient.query(`SELECT * FROM ${tableName} ${orderBy}`);
                const data = dataResult.rows;
                
                if (data.length === 0) {
                    console.log(`  ⚠️  Tabla ${tableName} está vacía`);
                    results.push({ table: tableName, records: 0, status: 'empty' });
                    continue;
                }

                // Convertir a CSV
                const csvContent = [
                    columns.join(','),
                    ...data.map(row => 
                        columns.map(column => {
                            const value = row[column];
                            if (value === null) return '';
                            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value;
                        }).join(',')
                    )
                ].join('\n');

                // Guardar archivo CSV
                const fileName = `${backupDir}/${tableName}.csv`;
                fs.writeFileSync(fileName, csvContent);
                
                console.log(`  ✅ ${tableName}: ${data.length} registros exportados`);
                totalRecords += data.length;
                results.push({ table: tableName, records: data.length, status: 'success' });

            } catch (error) {
                console.error(`  ❌ Error exportando ${tableName}:`, error.message);
                results.push({ table: tableName, records: 0, status: 'error', error: error.message });
            }
        }

        // Crear archivo de resumen
        const summaryContent = {
            timestamp: new Date().toISOString(),
            totalTables: tables.length,
            totalRecords: totalRecords,
            results: results
        };

        fs.writeFileSync(`${backupDir}/backup-summary.json`, JSON.stringify(summaryContent, null, 2));

        // Mostrar resumen final
        console.log('\n📊 Resumen del respaldo:');
        console.log('========================');
        console.log(`📁 Directorio: ${backupDir}/`);
        console.log(`📋 Tablas procesadas: ${tables.length}`);
        console.log(`📊 Total de registros: ${totalRecords}`);
        console.log('\n📋 Detalle por tabla:');
        
        results.forEach(result => {
            const status = result.status === 'success' ? '✅' : 
                          result.status === 'empty' ? '⚠️ ' : '❌';
            console.log(`  ${status} ${result.table}: ${result.records} registros`);
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        });

        // Crear script de importación para Supabase
        console.log('\n📝 Creando script de importación...');
        const importScript = `#!/bin/bash
# Script para importar datos a Supabase Cloud
# Ejecutar desde el directorio del proyecto

echo "🚀 Iniciando importación a Supabase Cloud..."

# Verificar que las variables de entorno estén configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: Configura las variables de entorno:"
    echo "   export SUPABASE_URL=https://tu-proyecto.supabase.co"
    echo "   export SUPABASE_SERVICE_KEY=tu-service-role-key"
    exit 1
fi

# Lista de archivos CSV a importar
CSV_FILES=(
    "configuracion.csv"
    "profiles.csv"
    "user_roles.csv"
    "empleados.csv"
    "productos.csv"
    "clientes.csv"
    "encargos.csv"
    "fichajes.csv"
    "incidencias.csv"
    "facturas.csv"
)

echo "📤 Importando archivos CSV..."

for csv_file in "\${CSV_FILES[@]}"; do
    if [ -f "backup-data/\$csv_file" ]; then
        echo "  📋 Importando \$csv_file..."
        # Aquí puedes agregar comandos específicos para importar a Supabase
        # Por ejemplo, usando curl o la CLI de Supabase
        echo "    ✅ \$csv_file listo para importar"
    else
        echo "  ⚠️  Archivo \$csv_file no encontrado"
    fi
done

echo "✅ Script de importación creado"
echo "💡 Para importar manualmente:"
echo "   1. Ve a Supabase Studio"
echo "   2. Table Editor > Import data"
echo "   3. Selecciona los archivos CSV de backup-data/"
`;

        fs.writeFileSync(`${backupDir}/import-to-supabase.sh`, importScript);
        fs.chmodSync(`${backupDir}/import-to-supabase.sh`, '755');

        console.log('\n🎯 Próximos pasos:');
        console.log('==================');
        console.log('1. 📁 Todos los datos están respaldados en: backup-data/');
        console.log('2. 🌐 Ve a tu dashboard de Lovable: https://lovable.dev/dashboard');
        console.log('3. 🔑 Obtén las credenciales de Supabase de tu proyecto');
        console.log('4. 📤 Importa los archivos CSV a Supabase Studio');
        console.log('5. 🔄 Actualiza tu archivo .env con las credenciales de Lovable');

    } catch (error) {
        console.error('❌ Error durante el respaldo:', error);
    } finally {
        await localClient.end();
    }
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
    backupAllData();
}

export { backupAllData };
