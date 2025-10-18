import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:8000';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

app.post('/holded-sync', async (req, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action, invoiceData, clientData, facturaId } = req.body || {};
    if (!action) return res.status(400).json({ error: 'action requerido' });

    // Obtener configuración de Holded
    const { data: configs, error: configError } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['holded_api_key', 'holded_company_id']);

    const configMap = configs?.reduce((acc, config) => {
      acc[config.clave] = config.valor;
      return acc;
    }, {}) || {};

    if (!configMap.holded_api_key) {
      throw new Error('Holded API key no configurada correctamente');
    }

    const holdedKey = configMap.holded_api_key;
    const companyId = configMap.holded_company_id;

    if (action === 'create_invoice') {
      // Crear factura en Holded
      console.log('📄 Invoice data received:', JSON.stringify(invoiceData, null, 2));
      
      const holdedInvoiceData = {
        ...invoiceData,
        contactId: invoiceData.customerId, // Mapear customerId a contactId
        companyId: companyId || undefined,
        date: Math.floor(Date.now() / 1000), // Timestamp en segundos
        dueDate: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000) // 30 días después
      };
      
      // Eliminar customerId del payload ya que usamos contactId
      delete holdedInvoiceData.customerId;
      
      console.log('📄 Holded invoice data:', JSON.stringify(holdedInvoiceData, null, 2));

      const response = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify(holdedInvoiceData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Invoice created in Holded:', result);

      // Guardar en base de datos local
      const { error: dbError } = await supabase
        .from('facturas')
        .insert({
          id: facturaId || crypto.randomUUID(),
          tipo: invoiceData.type || 'factura',
          cliente_id: invoiceData.customerId,
          total: invoiceData.total,
          estado: 'pendiente',
          fecha: new Date().toISOString(),
          fecha_vencimiento: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          holded_id: result.id
        });

      if (dbError) {
        console.error('Error saving to database:', dbError);
      }

      return res.json({ success: true, invoice: result });
    }

    if (action === 'create_contact') {
      // Crear cliente en Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Contact created in Holded:', result);

      return res.json({ success: true, contact: result });
    }

    if (action === 'get_invoices') {
      // Obtener facturas de Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice', {
        headers: {
          'Accept': 'application/json',
          'key': holdedKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const invoices = await response.json();
      console.log('Invoices fetched from Holded:', invoices.length);

      return res.json({ success: true, invoices });
    }

    if (action === 'get_contacts') {
      // Obtener contactos de Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/contacts', {
        headers: {
          'Accept': 'application/json',
          'key': holdedKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const contacts = await response.json();
      console.log('Contacts fetched from Holded:', contacts.length);

      return res.json({ success: true, contacts });
    }

    if (action === 'update_invoice_status') {
      // Actualizar estado de factura en Holded
      const { invoiceId, status } = invoiceData;
      
      if (!invoiceId || status === undefined) {
        return res.status(400).json({ error: 'invoiceId y status son requeridos' });
      }

      // Si el estado es 1 (pagada), manejar el pago
      if (status === 1) {
        // Primero obtener la factura para conocer su total y pagos existentes
        const getResponse = await fetch(`https://api.holded.com/api/invoicing/v1/documents/invoice/${invoiceId}`, {
          headers: {
            'Accept': 'application/json',
            'key': holdedKey
          }
        });

        if (getResponse.ok) {
          const invoice = await getResponse.json();
          const total = invoice.total || 0;
          const payments = invoice.payments || [];
          
          console.log('Invoice total from Holded:', total);
          console.log('Existing payments:', payments);
          
          // Si ya tiene pagos, actualizar el primero
          if (payments.length > 0) {
            const paymentId = payments[0].id;
            console.log('Updating existing payment:', paymentId);
            
            const updatePaymentResponse = await fetch(`https://api.holded.com/api/invoicing/v1/payments/${paymentId}`, {
              method: 'PUT',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'key': holdedKey
              },
              body: JSON.stringify({
                amount: total,
                date: Math.floor(Date.now() / 1000),
                desc: "Pago actualizado desde la aplicación"
              })
            });
            
            if (updatePaymentResponse.ok) {
              const paymentResult = await updatePaymentResponse.json();
              console.log('Payment updated in Holded:', paymentResult);
              return res.json({ success: true, invoice: { status: 1, info: "Payment updated" } });
            } else {
              const errorText = await updatePaymentResponse.text();
              console.error('Payment update error:', errorText);
            }
          } else {
            // Si no tiene pagos, crear uno nuevo
            console.log('Creating new payment');
            
            const paymentResponse = await fetch(`https://api.holded.com/api/invoicing/v1/documents/invoice/${invoiceId}/pay`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'key': holdedKey
              },
              body: JSON.stringify({
                amount: total,
                date: Math.floor(Date.now() / 1000),
                desc: "Pago automático desde la aplicación"
              })
            });
            
            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json();
              console.log('Payment created in Holded:', paymentResult);
              return res.json({ success: true, invoice: { status: 1, info: "Payment created" } });
            } else {
              const errorText = await paymentResponse.text();
              console.error('Payment creation error:', errorText);
            }
          }
        }
      }
      
      // Para otros estados, usar el endpoint normal de actualización
      const response = await fetch(`https://api.holded.com/api/invoicing/v1/documents/invoice/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Manejar el error específico de Holded: documentos aprobados no se pueden editar
        if (errorText.includes('Approved documents cannot be edited')) {
          console.log('Documento ya aprobado en Holded, solo actualizando localmente');
          return res.json({ 
            success: true, 
            invoice: { 
              status, 
              info: "Documento ya aprobado en Holded, actualizado solo localmente" 
            } 
          });
        }
        
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Invoice status updated in Holded:', result);

      // Actualizar en base de datos local
      const { error: dbError } = await supabase
        .from('facturas')
        .update({ 
          estado: status === 1 ? 'enviada' : status === 2 ? 'pagada' : 'pendiente'
        })
        .eq('holded_id', invoiceId);

      if (dbError) {
        console.error('Error updating in database:', dbError);
      }

      return res.json({ success: true, invoice: result });
    }

    if (action === 'create_product') {
      // Crear producto en Holded
      const productData = {
        kind: 'simple', // Tipo de producto básico según documentación de Holded
        ...invoiceData,
        companyId: companyId || undefined
      };

      const response = await fetch('https://api.holded.com/api/invoicing/v1/products', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Product created in Holded:', result);

      return res.json({ success: true, product: result });
    }

    if (action === 'update_product') {
      // Actualizar producto en Holded
      const { productId, ...productData } = invoiceData;
      
      if (!productId) {
        return res.status(400).json({ error: 'productId es requerido' });
      }

      const response = await fetch(`https://api.holded.com/api/invoicing/v1/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify({
          kind: 'simple', // Tipo de producto básico según documentación de Holded
          ...productData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Product updated in Holded:', result);

      return res.json({ success: true, product: result });
    }

    if (action === 'get_products') {
      // Obtener productos de Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/products', {
        headers: {
          'Accept': 'application/json',
          'key': holdedKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const products = await response.json();
      console.log('Products fetched from Holded:', products.length);

      return res.json({ success: true, products });
    }

    return res.status(400).json({ error: 'Acción no válida' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
});

app.post('/woocommerce-sync', async (req, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action, productData } = req.body || {};
    if (!action) return res.status(400).json({ error: 'action requerido' });

    // Config Woo
    const { data: config, error: configError } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['woo_url', 'woo_key', 'woo_secret']);
    if (configError) throw configError;
    if (!config || config.length < 3) throw new Error('WooCommerce no configurado');

    const wooUrl = config.find(c => c.clave === 'woo_url')?.valor;
    const wooKey = config.find(c => c.clave === 'woo_key')?.valor;
    const wooSecret = config.find(c => c.clave === 'woo_secret')?.valor;
    const auth = Buffer.from(`${wooKey}:${wooSecret}`).toString('base64');

    if (action === 'sync_products') {
      const r = await fetch(`${wooUrl}/wp-json/wc/v3/products?per_page=100`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (!r.ok) throw new Error(`Woo error: ${r.statusText}`);
      const wooProducts = await r.json();
      let synced = 0;
      for (const wp of wooProducts) {
        const payload = {
          nombre: wp.name,
          precio: parseFloat(wp.price || '0'),
          stock: wp.stock_quantity ?? 0,
          descripcion: wp.description || null,
          imagen_url: wp.images?.[0]?.src || null,
          categoria: wp.categories?.[0]?.name || 'General',
          woo_product_id: String(wp.id),
        };
        const { data: existing } = await supabase
          .from('productos')
          .select('id')
          .eq('woo_product_id', String(wp.id))
          .maybeSingle();
        if (existing) {
          await supabase.from('productos').update(payload).eq('id', existing.id);
        } else {
          await supabase.from('productos').insert(payload);
        }
        synced++;
      }
      return res.json({ success: true, synced });
    }

    if (action === 'create_product') {
      if (!productData) return res.status(400).json({ error: 'productData requerido' });
      const wpPayload = {
        name: productData.nombre,
        regular_price: String(productData.precio ?? 0),
        stock_quantity: productData.stock ?? 0,
        manage_stock: true,
        status: 'publish',
        description: productData.descripcion || '',
      };
      const r = await fetch(`${wooUrl}/wp-json/wc/v3/products`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(wpPayload),
      });
      if (!r.ok) throw new Error(`Woo error: ${r.statusText}`);
      const created = await r.json();
      if (productData.dbProductId) {
        await supabase.from('productos').update({ woo_product_id: String(created.id) }).eq('id', productData.dbProductId);
      }
      return res.json({ success: true, product: created });
    }

    if (action === 'update_product') {
      let productId = productData?.productId;
      if (!productId && productData?.dbProductId) {
        const { data: prod } = await supabase
          .from('productos')
          .select('woo_product_id')
          .eq('id', productData.dbProductId)
          .maybeSingle();
        if (prod?.woo_product_id) productId = prod.woo_product_id;
      }
      if (!productId) return res.status(400).json({ error: 'productId o dbProductId requerido' });
      const updateData = {};
      if (productData.stock !== undefined) updateData.stock_quantity = productData.stock;
      if (productData.precio !== undefined) updateData.regular_price = String(productData.precio);
      if (productData.nombre !== undefined) updateData.name = productData.nombre;
      const r = await fetch(`${wooUrl}/wp-json/wc/v3/products/${productId}`, {
        method: 'PUT',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!r.ok) throw new Error(`Woo error: ${r.statusText}`);
      const result = await r.json();
      return res.json({ success: true, result });
    }

    return res.status(400).json({ error: 'Acción no válida' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
});

const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Edge local listening on ${port}`);
});


