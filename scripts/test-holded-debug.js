#!/usr/bin/env node

// Script para debuggear el error de Holded
const fetch = require('node-fetch');

async function testHoldedAPI() {
  console.log('🔍 Probando API de Holded directamente...');
  
  try {
    // Probar directamente la API de Holded
    const response = await fetch('https://api.holded.com/api/invoicing/v1/contacts', {
      method: 'GET',
      headers: {
        'key': 'HOLDED_API_KEY',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response (first 200 chars):', text.substring(0, 200));
    
    if (text.includes('<div')) {
      console.log('❌ La API está devolviendo HTML en lugar de JSON');
    } else {
      console.log('✅ La API está devolviendo texto válido');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n🔍 Probando a través del proxy...');
  
  try {
    const response = await fetch('http://localhost:3003/contacts?apiKey=HOLDED_API_KEY');
    const result = await response.json();
    
    console.log('Proxy response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error en proxy:', error.message);
  }
}

testHoldedAPI();



