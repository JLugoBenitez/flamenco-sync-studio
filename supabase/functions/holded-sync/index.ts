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

    const { action, invoiceData, clientData } = await req.json();
    console.log('Holded sync action:', action);

    // Obtener API key de Holded
    const { data: config } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', 'holded_api_key')
      .single();

    if (!config?.valor) {
      throw new Error('Holded API key no configurada');
    }

    const holdedKey = config.valor;

    if (action === 'create_invoice') {
      // Crear factura en Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify(invoiceData)
      });

      const result = await response.json();
      console.log('Invoice created in Holded:', result);

      return new Response(JSON.stringify({ success: true, invoice: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

      const result = await response.json();
      console.log('Contact created in Holded:', result);

      return new Response(JSON.stringify({ success: true, contact: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_invoices') {
      // Obtener facturas de Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/documents/invoice', {
        headers: {
          'Accept': 'application/json',
          'key': holdedKey
        }
      });

      const invoices = await response.json();
      console.log('Invoices fetched from Holded:', invoices.length);

      return new Response(JSON.stringify({ success: true, invoices }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in Holded sync:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
