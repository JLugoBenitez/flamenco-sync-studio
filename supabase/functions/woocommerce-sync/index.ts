import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No autorizado');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('No autorizado');

    // Admin o empleado
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'empleado'])
      .maybeSingle();
    if (!roleData) throw new Error('Acceso denegado');

    const { action, productData } = await req.json();

    // Config Woo
    const { data: config } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['woo_url', 'woo_key', 'woo_secret']);
    if (!config || config.length < 3) throw new Error('WooCommerce no configurado');

    const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
    const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
    const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;
    const auth = btoa(`${wooKey}:${wooSecret}`);

    if (action === 'sync_products') {
      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products?per_page=100`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (!response.ok) throw new Error(`Error WooCommerce: ${response.statusText}`);
      const wooProducts = await response.json();

      let syncedCount = 0;
      for (const wp of wooProducts) {
        // upsert por woo_product_id si existe, sino por nombre
        const { data: existing } = await supabase
          .from('productos')
          .select('id, woo_product_id')
          .or(`woo_product_id.eq.${wp.id},nombre.eq.${wp.name}`)
          .maybeSingle();

        const payload: any = {
          nombre: wp.name,
          precio: parseFloat(wp.price || '0'),
          stock: wp.stock_quantity ?? 0,
          descripcion: wp.description || null,
          imagen_url: wp.images?.[0]?.src || null,
          categoria: wp.categories?.[0]?.name || 'General',
          woo_product_id: String(wp.id),
        };

        if (existing) {
          await supabase.from('productos').update(payload).eq('id', existing.id);
        } else {
          await supabase.from('productos').insert(payload);
        }
        syncedCount++;
      }

      return new Response(JSON.stringify({ success: true, synced: syncedCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_product') {
      if (!productData) throw new Error('Datos de producto requeridos');
      const wpPayload: any = {
        name: productData.nombre,
        regular_price: String(productData.precio ?? 0),
        stock_quantity: productData.stock ?? 0,
        manage_stock: true,
        status: 'publish',
        description: productData.descripcion || ''
      };

      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(wpPayload)
      });
      if (!response.ok) throw new Error(`Error WooCommerce: ${response.statusText}`);
      const created = await response.json();

      // Persistir woo_product_id en la app
      if (productData.dbProductId) {
        await supabase.from('productos').update({ woo_product_id: String(created.id) }).eq('id', productData.dbProductId);
      }

      return new Response(JSON.stringify({ success: true, product: created }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'update_product') {
      if (!productData || (!productData.productId && !productData.dbProductId)) {
        throw new Error('productId o dbProductId requerido');
      }

      // Resolver productId desde la base de datos si no viene
      let productId = productData.productId;
      if (!productId && productData.dbProductId) {
        const { data: prod } = await supabase
          .from('productos')
          .select('woo_product_id')
          .eq('id', productData.dbProductId)
          .maybeSingle();
        if (prod?.woo_product_id) productId = prod.woo_product_id;
      }
      if (!productId) throw new Error('No se pudo resolver productId');

      const updateData: any = {};
      if (productData.stock !== undefined) updateData.stock_quantity = productData.stock;
      if (productData.precio !== undefined) updateData.regular_price = String(productData.precio);
      if (productData.nombre !== undefined) updateData.name = productData.nombre;

      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error(`Error WooCommerce: ${response.statusText}`);
      const result = await response.json();

      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Acción no válida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error in WooCommerce sync:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});