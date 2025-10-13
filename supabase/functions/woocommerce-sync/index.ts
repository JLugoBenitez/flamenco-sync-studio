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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, productId, stockDelta } = await req.json();
    console.log('WooCommerce sync action:', action, productId, stockDelta);

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

    if (action === 'sync_stock') {
      // Sincronizar stock con WooCommerce
      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stock_quantity: stockDelta
        })
      });

      const result = await response.json();
      console.log('WooCommerce stock updated:', result);

      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'fetch_products') {
      // Obtener productos de WooCommerce
      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      const products = await response.json();
      console.log('Products fetched from WooCommerce:', products.length);

      return new Response(JSON.stringify({ success: true, products }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in WooCommerce sync:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
