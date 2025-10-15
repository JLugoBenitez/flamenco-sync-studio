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
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No autorizado');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar el token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('No autorizado');
    }

    // Verificar que el usuario tenga rol de admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      throw new Error('Acceso denegado: se requiere rol de administrador');
    }

    const { action, productData } = await req.json();
    console.log('WooCommerce sync action:', action);

    // Obtener configuración de WooCommerce
    const { data: config } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['woo_url', 'woo_key', 'woo_secret']);

    if (!config || config.length < 3) {
      throw new Error('WooCommerce no configurado');
    }

    const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
    const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
    const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;

    const auth = btoa(`${wooKey}:${wooSecret}`);

    if (action === 'sync_products') {
      // Obtener productos de WooCommerce
      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products?per_page=100`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error de WooCommerce: ${response.statusText}`);
      }

      const wooProducts = await response.json();
      console.log('Products fetched from WooCommerce:', wooProducts.length);

      let syncedCount = 0;

      // Sincronizar cada producto
      for (const wooProduct of wooProducts) {
        // Verificar si el producto ya existe
        const { data: existingProduct } = await supabase
          .from('productos')
          .select('id, stock')
          .eq('nombre', wooProduct.name)
          .maybeSingle();

        if (existingProduct) {
          // Actualizar producto existente
          await supabase
            .from('productos')
            .update({
              precio: parseFloat(wooProduct.price || 0),
              stock: wooProduct.stock_quantity || 0,
              descripcion: wooProduct.description || null,
              imagen_url: wooProduct.images?.[0]?.src || null,
            })
            .eq('id', existingProduct.id);
        } else {
          // Crear nuevo producto
          await supabase
            .from('productos')
            .insert({
              nombre: wooProduct.name,
              precio: parseFloat(wooProduct.price || 0),
              stock: wooProduct.stock_quantity || 0,
              categoria: wooProduct.categories?.[0]?.name || 'General',
              descripcion: wooProduct.description || null,
              imagen_url: wooProduct.images?.[0]?.src || null,
            });
        }
        syncedCount++;
      }

      return new Response(JSON.stringify({ success: true, synced: syncedCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'update_product') {
      // Actualizar producto en WooCommerce
      const { productId, stock, price } = productData;

      const updateData: any = {};
      if (stock !== undefined) updateData.stock_quantity = stock;
      if (price !== undefined) updateData.regular_price = price.toString();

      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Error de WooCommerce: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('WooCommerce product updated:', result);

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