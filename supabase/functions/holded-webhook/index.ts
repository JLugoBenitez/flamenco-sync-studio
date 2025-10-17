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

    const webhookData = await req.json();
    console.log('Holded webhook received:', webhookData);

    // Procesar diferentes tipos de webhooks de Holded
    const { event, data } = webhookData;

    switch (event) {
      case 'invoice.created':
        await handleInvoiceCreated(supabase, data);
        break;
      case 'invoice.updated':
        await handleInvoiceUpdated(supabase, data);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(supabase, data);
        break;
      case 'contact.created':
        await handleContactCreated(supabase, data);
        break;
      case 'contact.updated':
        await handleContactUpdated(supabase, data);
        break;
      default:
        console.log('Webhook event not handled:', event);
    }

    return new Response(JSON.stringify({ success: true, message: 'Webhook processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing Holded webhook:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleInvoiceCreated(supabase: any, invoiceData: any) {
  console.log('Processing invoice created:', invoiceData);
  
  // Sincronizar factura con la base de datos local
  const { error } = await supabase
    .from('facturas')
    .upsert({
      id: invoiceData.id,
      tipo: 'factura',
      cliente_id: invoiceData.customerId,
      total: invoiceData.total,
      estado: 'pendiente',
      fecha: invoiceData.date,
      fecha_vencimiento: invoiceData.dueDate,
      holded_id: invoiceData.id,
      descripcion: invoiceData.description
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error syncing invoice:', error);
  } else {
    console.log('Invoice synced successfully');
  }
}

async function handleInvoiceUpdated(supabase: any, invoiceData: any) {
  console.log('Processing invoice updated:', invoiceData);
  
  // Actualizar factura existente
  const { error } = await supabase
    .from('facturas')
    .update({
      total: invoiceData.total,
      estado: invoiceData.status === 'paid' ? 'pagada' : 'pendiente',
      fecha_vencimiento: invoiceData.dueDate,
      descripcion: invoiceData.description
    })
    .eq('holded_id', invoiceData.id);

  if (error) {
    console.error('Error updating invoice:', error);
  } else {
    console.log('Invoice updated successfully');
  }
}

async function handleInvoicePaid(supabase: any, invoiceData: any) {
  console.log('Processing invoice paid:', invoiceData);
  
  // Marcar factura como pagada
  const { error } = await supabase
    .from('facturas')
    .update({
      estado: 'pagada'
    })
    .eq('holded_id', invoiceData.id);

  if (error) {
    console.error('Error marking invoice as paid:', error);
  } else {
    console.log('Invoice marked as paid successfully');
  }
}

async function handleContactCreated(supabase: any, contactData: any) {
  console.log('Processing contact created:', contactData);
  
  // Sincronizar cliente con la base de datos local
  const { error } = await supabase
    .from('clientes')
    .upsert({
      id: contactData.id,
      nombre: contactData.name,
      email: contactData.email,
      telefono: contactData.phone,
      direccion: contactData.address,
      holded_id: contactData.id
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error syncing contact:', error);
  } else {
    console.log('Contact synced successfully');
  }
}

async function handleContactUpdated(supabase: any, contactData: any) {
  console.log('Processing contact updated:', contactData);
  
  // Actualizar cliente existente
  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: contactData.name,
      email: contactData.email,
      telefono: contactData.phone,
      direccion: contactData.address
    })
    .eq('holded_id', contactData.id);

  if (error) {
    console.error('Error updating contact:', error);
  } else {
    console.log('Contact updated successfully');
  }
}
