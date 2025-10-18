const fetch = require('node-fetch');

async function testSyncFactura() {
  try {
    console.log('🔄 Probando sincronización de factura...');
    
    // Obtener la factura de la base de datos
    const facturaResponse = await fetch('http://localhost:8000/rest/v1/facturas?id=eq.test-sync-123&select=*,clientes(nombre,email,telefono,direccion,cif_nif)', {
      headers: {
        'apikey': 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"',
        'Content-Type': 'application/json'
      }
    });
    
    const facturas = await facturaResponse.json();
    const factura = facturas[0];
    
    if (!factura) {
      console.log('❌ No se encontró la factura');
      return;
    }
    
    console.log('📄 Factura encontrada:', factura.id);
    
    // Preparar datos para Holded
    const holdedInvoiceData = {
      docType: "invoice",
      date: Math.floor(new Date().getTime() / 1000),
      contactName: factura.clientes?.nombre || "Cliente sin nombre",
      desc: factura.descripcion || `Factura ${factura.tipo}`,
      currency: "EUR",
      items: [
        {
          desc: factura.descripcion || `Factura ${factura.tipo}`,
          qty: 1,
          price: factura.total || 0,
          total: factura.total || 0,
          sku: `FAC-${factura.id.slice(0, 8)}`
        }
      ]
    };
    
    console.log('📤 Enviando a Holded:', holdedInvoiceData);
    
    // Enviar a Holded
    const holdedResponse = await fetch('http://localhost:3003/documents/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holdedInvoiceData),
    });
    
    const holdedResult = await holdedResponse.json();
    console.log('📥 Respuesta de Holded:', holdedResult);
    
    if (holdedResult.success) {
      // Actualizar la factura local
      const updateResponse = await fetch(`http://localhost:8000/rest/v1/facturas?id=eq.${factura.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY"'
        },
        body: JSON.stringify({
          holded_id: holdedResult.data?.id,
          sincronizada_holded: true,
          fecha_sincronizacion_holded: new Date().toISOString()
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Factura sincronizada correctamente con Holded');
        console.log('🆔 ID de Holded:', holdedResult.data?.id);
      } else {
        console.log('❌ Error actualizando factura local');
      }
    } else {
      console.log('❌ Error enviando a Holded:', holdedResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSyncFactura();



