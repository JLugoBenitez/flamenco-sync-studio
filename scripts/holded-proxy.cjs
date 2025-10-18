const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Holded - según documentación oficial
const HOLDED_API_BASE = 'https://api.holded.com/api/invoicing/v1';

// Función para obtener configuración de Holded desde la base de datos
async function getHoldedConfig() {
  try {
    const { stdout } = await execAsync(`docker exec flamenco_db psql -U postgres -d postgres -c "
      SELECT clave, valor 
      FROM public.configuracion 
      WHERE clave IN ('holded_api_key', 'holded_company_id')
      ORDER BY clave;
    "`);
    
    const lines = stdout.split('\n').filter(line => line.includes('|'));
    const config = {};
    
    lines.forEach(line => {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length >= 2) {
        const [clave, valor] = parts;
        if (clave && valor && clave !== 'clave') {
          config[clave] = valor;
        }
      }
    });
    
    return {
      apiKey: config.holded_api_key || null,
      companyId: config.holded_company_id || null
    };
  } catch (error) {
    console.error('❌ Error obteniendo configuración de Holded:', error.message);
    return {
      apiKey: null,
      companyId: null
    };
  }
}

// Función para hacer peticiones a Holded
async function makeHoldedRequest(endpoint, method = 'GET', data = null, apiKey) {
  const url = `${HOLDED_API_BASE}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'key': apiKey,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // Si no es JSON, obtener el texto para debug
      const text = await response.text();
      console.log('⚠️  Holded API returned non-JSON response:');
      console.log('Status:', response.status);
      console.log('Content-Type:', contentType);
      console.log('Response:', text.substring(0, 200) + '...');
      
      return {
        success: false,
        status: response.status,
        error: `API returned non-JSON response: ${response.status}`,
        data: { response: text.substring(0, 200) }
      };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('❌ Holded API request failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Endpoint para obtener configuración de Holded
app.get('/config', async (req, res) => {
  try {
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }
    
    res.json({
      success: true,
      data: {
        apiKey: config.apiKey,
        companyId: config.companyId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener contactos
app.get('/contacts', async (req, res) => {
  try {
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    const result = await makeHoldedRequest('/contacts', 'GET', null, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para crear contacto
app.post('/contacts', async (req, res) => {
  try {
    const { contactData } = req.body;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    const result = await makeHoldedRequest('/contacts', 'POST', contactData, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener facturas/documentos
app.get('/invoices', async (req, res) => {
  try {
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    // Usar el endpoint correcto para facturas: /documents/invoice
    const result = await makeHoldedRequest('/documents/invoice', 'GET', null, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para crear factura/documento
app.post('/invoices', async (req, res) => {
  try {
    const { invoiceData } = req.body;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    // Usar el endpoint correcto para crear facturas: /documents/invoice
    const result = await makeHoldedRequest('/documents/invoice', 'POST', invoiceData, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para crear factura/documento (nuevo endpoint correcto)
app.post('/documents/invoice', async (req, res) => {
  try {
    const invoiceData = req.body;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    console.log('📝 Creando factura en Holded:', invoiceData);
    
    // Usar el endpoint correcto para crear facturas: /documents/invoice
    const result = await makeHoldedRequest('/documents/invoice', 'POST', invoiceData, config.apiKey);
    res.json(result);
  } catch (error) {
    console.error('❌ Error creando factura:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para actualizar factura/documento
app.put('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceData } = req.body;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    // Usar el endpoint correcto para actualizar facturas: /documents/invoice/{id}
    const result = await makeHoldedRequest(`/documents/invoice/${id}`, 'PUT', invoiceData, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para eliminar factura/documento
app.delete('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    // Usar el endpoint correcto para eliminar facturas: /documents/invoice/{id}
    const result = await makeHoldedRequest(`/documents/invoice/${id}`, 'DELETE', null, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener PDF de factura/documento
app.get('/invoices/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    // Usar el endpoint correcto para obtener PDF: /documents/invoice/{id}/pdf
    const result = await makeHoldedRequest(`/documents/invoice/${id}/pdf`, 'GET', null, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener productos
app.get('/products', async (req, res) => {
  try {
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    const result = await makeHoldedRequest('/items', 'GET', null, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para crear producto
app.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    const config = await getHoldedConfig();
    
    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Holded API key not configured'
      });
    }

    const result = await makeHoldedRequest('/items', 'POST', productData, config.apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Holded proxy is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 Holded proxy running on http://localhost:3003');
  console.log('📋 Available endpoints:');
  console.log('   GET  /config - Get Holded configuration');
  console.log('   GET  /contacts - Get contacts (real API)');
  console.log('   POST /contacts - Create contact (real API)');
  console.log('   GET  /products - Get products (real API)');
  console.log('   POST /products - Create product (real API)');
  console.log('   GET  /invoices - Get invoices (real API)');
  console.log('   POST /invoices - Create invoice (real API)');
  console.log('   PUT  /invoices/:id - Update invoice (real API)');
  console.log('   DELETE /invoices/:id - Delete invoice (real API)');
  console.log('   GET  /invoices/:id/pdf - Get invoice PDF (real API)');
  console.log('🔍 Health check: GET /health');
  console.log('✅ Using correct Holded API endpoints: /documents/invoice');
});
