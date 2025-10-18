#!/usr/bin/env node

const fetch = require('node-fetch');

const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY"';
const HOLDED_SYNC_URL = 'http://localhost:54321/holded-sync';

async function getProducts() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error obteniendo productos: ${response.status}`);
  }
  
  return await response.json();
}

async function syncProductToHolded(producto) {
  const holdedProductData = {
    name: producto.nombre,
    desc: producto.descripcion || '',
    subtotal: producto.precio || 0,
    tax: 21, // IVA por defecto
    sku: `PROD-${producto.id.slice(0, 8)}`,
    cost: producto.precio || 0,
    purchasePrice: producto.precio || 0,
    stock: producto.stock || 0
  };

  const response = await fetch(HOLDED_SYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'create_product',
      invoiceData: holdedProductData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error sincronizando producto ${producto.nombre}: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function updateProductWithHoldedId(productoId, holdedId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${productoId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      holded_id: holdedId
    })
  });

  if (!response.ok) {
    throw new Error(`Error actualizando producto ${productoId}: ${response.status}`);
  }
}

async function main() {
  try {
    console.log('🔄 Iniciando sincronización de productos con Holded...');
    
    const productos = await getProducts();
    console.log(`📦 Encontrados ${productos.length} productos para sincronizar`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const producto of productos) {
      try {
        console.log(`⏳ Sincronizando: ${producto.nombre}...`);
        
        const result = await syncProductToHolded(producto);
        
        if (result.success) {
          // Actualizar el producto local con el ID de Holded
          await updateProductWithHoldedId(producto.id, result.product.id);
          
          console.log(`✅ ${producto.nombre} sincronizado exitosamente (ID: ${result.product.id})`);
          successCount++;
        } else {
          console.log(`❌ Error sincronizando ${producto.nombre}: ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Error sincronizando ${producto.nombre}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumen de sincronización:');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📦 Total: ${productos.length}`);
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
    process.exit(1);
  }
}

main();
