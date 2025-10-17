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

    const { action, invoiceData, clientData, facturaId } = await req.json();
    console.log('Holded sync action:', action);

    // Obtener configuración de Holded
    const { data: configs } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['holded_api_key', 'holded_company_id']);

    const configMap = configs?.reduce((acc, config) => {
      acc[config.clave] = config.valor;
      return acc;
    }, {} as Record<string, string>) || {};

    if (!configMap.holded_api_key || configMap.holded_api_key === 'tu_api_key_aqui') {
      throw new Error('Holded API key no configurada correctamente');
    }

    const holdedKey = configMap.holded_api_key;
    const companyId = configMap.holded_company_id;

    if (action === 'create_invoice') {
      // Crear factura en Holded
      const holdedInvoiceData = {
        ...invoiceData,
        companyId: companyId || undefined
      };

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const invoices = await response.json();
      console.log('Invoices fetched from Holded:', invoices.length);

      return new Response(JSON.stringify({ success: true, invoices }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_estimate') {
      // Crear presupuesto en Holded
      const response = await fetch('https://api.holded.com/api/invoicing/v1/documents/estimate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'key': holdedKey
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Estimate created in Holded:', result);

      return new Response(JSON.stringify({ success: true, estimate: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

      return new Response(JSON.stringify({ success: true, contacts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'sync_invoices') {
      // Sincronizar facturas desde Holded a la base de datos local
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
      console.log('Syncing invoices from Holded:', invoices.length);

      // Sincronizar cada factura
      for (const invoice of invoices) {
        const { error } = await supabase
          .from('facturas')
          .upsert({
            id: invoice.id,
            tipo: 'factura',
            cliente_id: invoice.customerId,
            total: invoice.total,
            estado: invoice.status === 'paid' ? 'pagada' : 'pendiente',
            fecha: invoice.date,
            fecha_vencimiento: invoice.dueDate,
            holded_id: invoice.id
          }, { onConflict: 'id' });

        if (error) {
          console.error('Error syncing invoice:', error);
        }
      }

      return new Response(JSON.stringify({ success: true, synced: invoices.length }), {
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