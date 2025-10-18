import { supabase } from "@/integrations/supabase/client";
import holdedService from "./holdedService";

class FacturaSyncService {
  // Sincronizar una factura específica con Holded
  async syncFacturaToHolded(facturaId: string) {
    try {
      // Obtener la factura de la base de datos local
      const { data: factura, error: facturaError } = await supabase
        .from("facturas")
        .select(`
          *,
          clientes(nombre, email, telefono, direccion, cif_nif)
        `)
        .eq("id", facturaId)
        .single();

      if (facturaError || !factura) {
        throw new Error(`Error obteniendo factura: ${facturaError?.message}`);
      }

      // Preparar datos para Holded con parámetros mínimos requeridos
      const holdedInvoiceData = {
        docType: "invoice",
        date: Math.floor(new Date().getTime() / 1000), // Timestamp en segundos - REQUERIDO
        contactName: factura.clientes?.nombre || "Cliente sin nombre", // REQUERIDO
        desc: factura.descripcion || `Factura ${factura.tipo}`,
        currency: "EUR",
        items: [
          {
            desc: factura.descripcion || `Factura ${factura.tipo}`,
            qty: 1,
            price: factura.total || 0,
            total: factura.total || 0
          }
        ]
      };

      // Crear factura en Holded
      const result = await holdedService.createInvoice(holdedInvoiceData);
      
      console.log("Resultado de Holded:", result);
      
      if (result && result.success) {
        // Actualizar la factura local con el ID de Holded
        await supabase
          .from("facturas")
          .update({ 
            holded_id: result.data?.id || result.data?.invoiceId,
            sincronizada_holded: true,
            fecha_sincronizacion_holded: new Date().toISOString()
          })
          .eq("id", facturaId);

        return {
          success: true,
          message: "Factura sincronizada correctamente con Holded",
          holdedId: result.data?.id || result.data?.invoiceId
        };
      } else {
        const errorMessage = result?.error || result?.message || `Error desconocido de Holded. Respuesta: ${JSON.stringify(result)}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error sincronizando factura con Holded:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sincronizar todas las facturas pendientes
  async syncAllFacturasToHolded() {
    try {
      const { data: facturas, error } = await supabase
        .from("facturas")
        .select(`
          *,
          clientes(nombre, email, telefono, direccion, cif_nif)
        `)
        .or("sincronizada_holded.is.null,sincronizada_holded.eq.false");

      if (error) {
        throw new Error(`Error obteniendo facturas: ${error.message}`);
      }

      const results = {
        success: 0,
        errors: 0,
        details: [] as any[]
      };

      for (const factura of facturas || []) {
        try {
          const result = await this.syncFacturaToHolded(factura.id);
          if (result.success) {
            results.success++;
            results.details.push({
              type: "success",
              message: `Factura ${factura.id.slice(0, 8)}... sincronizada correctamente`,
              data: result
            });
          } else {
            results.errors++;
            results.details.push({
              type: "error",
              message: `Error sincronizando factura ${factura.id.slice(0, 8)}...: ${result.error}`,
              data: result
            });
          }
        } catch (error: any) {
          results.errors++;
          results.details.push({
            type: "error",
            message: `Error sincronizando factura ${factura.id.slice(0, 8)}...: ${error.message}`,
            data: { error: error.toString() }
          });
        }
      }

      return results;
    } catch (error: any) {
      console.error("Error sincronizando facturas con Holded:", error);
      return {
        success: 0,
        errors: 0,
        details: [{
          type: "error",
          message: `Error general: ${error.message}`,
          data: { error: error.toString() }
        }]
      };
    }
  }

  // Mapear estado local a estado de Holded
  private mapEstadoToHolded(estado: string): string {
    switch (estado) {
      case "pendiente":
        return "draft";
      case "pagado":
        return "paid";
      case "vencido":
        return "overdue";
      default:
        return "draft";
    }
  }

  // Obtener facturas sincronizadas
  async getFacturasSincronizadas() {
    try {
      const { data, error } = await supabase
        .from("facturas")
        .select(`
          *,
          clientes(nombre, email)
        `)
        .eq("sincronizada_holded", true)
        .order("fecha_sincronizacion_holded", { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo facturas sincronizadas: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error("Error obteniendo facturas sincronizadas:", error);
      return [];
    }
  }
}

export default new FacturaSyncService();
