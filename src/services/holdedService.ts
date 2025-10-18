// Servicio de Holded para integración con facturación
class HoldedService {
  private baseUrl = 'http://localhost:3004/holded-sync';

  // Obtener configuración de Holded
  async getConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/config`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo configuración de Holded:', error);
      throw error;
    }
  }

  // Obtener contactos
  async getContacts() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_contacts'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo contactos de Holded:', error);
      throw error;
    }
  }

  // Crear contacto
  async createContact(contactData: any) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_contact',
          clientData: contactData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando contacto en Holded:', error);
      throw error;
    }
  }

  // Obtener facturas/documentos
  async getInvoices() {
    try {
      console.log("Obteniendo facturas de Holded...");
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_invoices'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo facturas de Holded:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener una factura específica por ID
  async getInvoiceById(documentId: string) {
    try {
      // Por ahora, obtener todas las facturas y filtrar por ID
      const invoicesResponse = await this.getInvoices();
      
      if (invoicesResponse.success && invoicesResponse.data) {
        const invoice = invoicesResponse.data.find((inv: any) => inv.id === documentId);
        
        if (invoice) {
          return {
            success: true,
            data: invoice
          };
        } else {
          return {
            success: false,
            error: 'Factura no encontrada'
          };
        }
      } else {
        return {
          success: false,
          error: 'Error obteniendo facturas'
        };
      }
    } catch (error) {
      console.error('Error obteniendo factura específica de Holded:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear factura/documento
  async createInvoice(invoiceData: any) {
    try {
      // Usar la Edge Function de Holded
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_invoice',
          invoiceData: invoiceData
        }),
      });
      
      console.log("Respuesta de Holded para crear factura:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded Edge Function error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.invoice || data.data
        };
      } else {
        throw new Error(data.error || 'Error desconocido de Holded');
      }
    } catch (error) {
      console.error('Error creando factura en Holded:', error);
      throw error;
    }
  }

  // Obtener productos
  async getProducts() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_products'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo productos de Holded:', error);
      throw error;
    }
  }

  // Crear producto
  async createProduct(productData: any) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_product',
          invoiceData: productData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando producto en Holded:', error);
      throw error;
    }
  }

  // Actualizar producto
  async updateProduct(productId: string, productData: any) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_product',
          invoiceData: {
            productId,
            ...productData
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando producto en Holded:', error);
      throw error;
    }
  }

  // Actualizar estado de factura
  async updateInvoiceStatus(invoiceId: string, status: number) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_invoice_status',
          invoiceData: {
            invoiceId,
            status
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Holded Edge Function error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando estado de factura en Holded:', error);
      throw error;
    }
  }

  // Obtener PDF de factura
  async getInvoicePDF(invoiceId: string) {
    try {
      // Por ahora, simular obtención de PDF ya que la Edge Function no tiene esta acción
      return {
        success: true,
        data: {
          pdfUrl: `#`,
          message: "PDF simulado (función no implementada en Edge Function)"
        }
      };
    } catch (error) {
      console.error('Error obteniendo PDF de factura:', error);
      throw error;
    }
  }

  // Verificar conexión con Holded
  async testConnection() {
    try {
      // Probar la conexión con la Edge Function
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_contacts'
        }),
      });
      
      if (response.ok) {
        return {
          success: true,
          message: 'Conexión con Holded Edge Function exitosa'
        };
      } else {
        return {
          success: false,
          message: 'Error conectando con Holded Edge Function',
          error: `Status: ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error conectando con Holded',
        error: error
      };
    }
  }

  // Sincronizar factura individual con Holded (función faltante)
  async syncInvoiceToHolded(factura: any) {
    try {
      const holdedInvoiceData = {
        docType: "invoice",
        contactName: factura.clientes?.nombre || "Cliente sin nombre",
        contactEmail: factura.clientes?.email || "",
        contactAddress: factura.clientes?.direccion || "",
        contactCity: "", // Ciudad no disponible en la base de datos
        contactCp: "", // Código postal no disponible en la base de datos
        contactProvince: "", // Provincia no disponible
        contactCountryCode: "ES", // España por defecto
        desc: factura.descripcion || `Factura ${factura.tipo}`,
        date: Math.floor(new Date().getTime() / 1000), // Timestamp en segundos
        notes: `Factura sincronizada desde Flamenco Sync Studio - ID: ${factura.id}`,
        currency: "EUR",
        dueDate: factura.fecha_vencimiento ? Math.floor(new Date(factura.fecha_vencimiento).getTime() / 1000) : Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        items: [
          {
            desc: factura.descripcion || `Factura ${factura.tipo}`,
            qty: 1,
            price: factura.total || 0,
            total: factura.total || 0,
            sku: `FAC-${factura.id.slice(0, 8)}` // SKU único para la factura
          }
        ],
        approveDoc: false
      };

      const result = await this.createInvoice(holdedInvoiceData);
      
      if (result && result.success) {
        return result.data?.id || result.data?.invoiceId;
      } else {
        throw new Error(result?.error || result?.message || "Error desconocido de Holded");
      }
    } catch (error: any) {
      console.error("Error sincronizando factura con Holded:", error);
      throw error;
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
}

export default new HoldedService();