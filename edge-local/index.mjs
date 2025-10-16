import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://kong:8000';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

const port = process.env.PORT || 54321;
app.listen(port, () => {
  console.log(`Edge local listening on ${port}`);
});


