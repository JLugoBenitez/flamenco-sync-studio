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

async function getHoldedProducts() {
  const response = await fetch(HOLDED_SYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'get_products'
    })
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo productos de Holded: ${response.status}`);
  }

  const data = await response.json();
  return data.products || [];
}

async function updateProductHoldedId(productoId, holdedId) {
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
    console.log('🔄 Obteniendo productos locales y de Holded...');
    
    const [productosLocales, productosHolded] = await Promise.all([
      getProducts(),
      getHoldedProducts()
    ]);
    
    console.log(`📦 Productos locales: ${productosLocales.length}`);
    console.log(`🏪 Productos en Holded: ${productosHolded.length}`);
    
    let updatedCount = 0;
    
    for (const productoLocal of productosLocales) {
      // Buscar el producto en Holded por SKU
      const skuLocal = `PROD-${productoLocal.id.slice(0, 8)}`;
      const productoHolded = productosHolded.find(p => p.sku === skuLocal);
      
      if (productoHolded) {
        try {
          await updateProductHoldedId(productoLocal.id, productoHolded.id);
          console.log(`✅ ${productoLocal.nombre} → ${productoHolded.id}`);
          updatedCount++;
        } catch (error) {
          console.log(`❌ Error actualizando ${productoLocal.nombre}: ${error.message}`);
        }
      } else {
        console.log(`⚠️  No encontrado en Holded: ${productoLocal.nombre} (SKU: ${skuLocal})`);
      }
    }
    
    console.log(`\n📊 Actualizados: ${updatedCount}/${productosLocales.length} productos`);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

main();
