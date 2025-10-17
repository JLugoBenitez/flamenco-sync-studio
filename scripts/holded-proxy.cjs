const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Holded
const HOLDED_API_BASE = 'https://api.holded.com/api/invoicing/v1';

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
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Endpoint para obtener configuración de Holded
app.get('/config', async (req, res) => {
  try {
    // Simular obtención de configuración desde base de datos
    res.json({
      success: true,
      data: {
        apiKey: 'test-api-key-12345',
        companyId: 'tu_company_id_aqui'
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
    const { apiKey } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest('/contacts', 'GET', null, apiKey);
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
    const { apiKey, contactData } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest('/contacts', 'POST', contactData, apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener facturas
app.get('/invoices', async (req, res) => {
  try {
    const { apiKey } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest('/invoices', 'GET', null, apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para crear factura
app.post('/invoices', async (req, res) => {
  try {
    const { apiKey, invoiceData } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest('/invoices', 'POST', invoiceData, apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para actualizar factura
app.put('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey, invoiceData } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest(`/invoices/${id}`, 'PUT', invoiceData, apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para eliminar factura
app.delete('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest(`/invoices/${id}`, 'DELETE', null, apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener PDF de factura
app.get('/invoices/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const { apiKey } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const result = await makeHoldedRequest(`/invoices/${id}/pdf`, 'GET', null, apiKey);
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
  console.log('   GET  /contacts - Get contacts');
  console.log('   POST /contacts - Create contact');
  console.log('   GET  /invoices - Get invoices');
  console.log('   POST /invoices - Create invoice');
  console.log('   PUT  /invoices/:id - Update invoice');
  console.log('   DELETE /invoices/:id - Delete invoice');
  console.log('   GET  /invoices/:id/pdf - Get invoice PDF');
  console.log('🔍 Health check: GET /health');
});
