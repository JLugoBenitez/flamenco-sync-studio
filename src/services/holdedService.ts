import { supabase } from '@/integrations/supabase/client';

interface HoldedConfig {
  apiKey: string;
  companyId: string;
}

interface HoldedContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface HoldedInvoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  customerId: string;
  customerName: string;
  total: number;
  status: string;
  items: HoldedInvoiceItem[];
}

interface HoldedInvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}

class HoldedService {
  private config: HoldedConfig | null = null;
  private proxyUrl = 'http://localhost:3003';

  async getConfig(): Promise<HoldedConfig> {
    if (this.config) return this.config;

    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['holded_api_key', 'holded_company_id']);

      if (error) throw error;

      const configData = data.reduce((acc, item) => {
        acc[item.clave] = item.valor;
        return acc;
      }, {} as any);

      if (!configData.holded_api_key || !configData.holded_company_id) {
        throw new Error('Configuración de Holded incompleta');
      }

      this.config = {
        apiKey: configData.holded_api_key,
        companyId: configData.holded_company_id
      };

      return this.config;
    } catch (error) {
      console.error('Error getting Holded config:', error);
      throw new Error('No se pudo obtener la configuración de Holded');
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const config = await this.getConfig();
    
    const url = `${this.proxyUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method === 'GET') {
      const params = new URLSearchParams({ apiKey: config.apiKey });
      const response = await fetch(`${url}?${params}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded Proxy Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error en la petición a Holded');
      }

      return result.data;
    } else {
      options.body = JSON.stringify({
        apiKey: config.apiKey,
        ...(data && { [endpoint.includes('contacts') ? 'contactData' : 'invoiceData']: data })
      });

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Holded Proxy Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error en la petición a Holded');
      }

      return result.data;
    }
  }

  async getContacts(): Promise<HoldedContact[]> {
    try {
      const data = await this.makeRequest('/contacts');
      return data || [];
    } catch (error) {
      console.error('Error fetching contacts from Holded:', error);
      return [];
    }
  }

  async createContact(contactData: Partial<HoldedContact>): Promise<HoldedContact | null> {
    try {
      const data = await this.makeRequest('/contacts', 'POST', contactData);
      return data || null;
    } catch (error) {
      console.error('Error creating contact in Holded:', error);
      return null;
    }
  }

  async getInvoices(): Promise<HoldedInvoice[]> {
    try {
      const data = await this.makeRequest('/invoices');
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices from Holded:', error);
      return [];
    }
  }

  async createInvoice(invoiceData: Partial<HoldedInvoice>): Promise<HoldedInvoice | null> {
    try {
      const data = await this.makeRequest('/invoices', 'POST', invoiceData);
      return data || null;
    } catch (error) {
      console.error('Error creating invoice in Holded:', error);
      return null;
    }
  }

  async updateInvoice(invoiceId: string, invoiceData: Partial<HoldedInvoice>): Promise<HoldedInvoice | null> {
    try {
      const data = await this.makeRequest(`/invoices/${invoiceId}`, 'PUT', invoiceData);
      return data || null;
    } catch (error) {
      console.error('Error updating invoice in Holded:', error);
      return null;
    }
  }

  async deleteInvoice(invoiceId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/invoices/${invoiceId}`, 'DELETE');
      return true;
    } catch (error) {
      console.error('Error deleting invoice from Holded:', error);
      return false;
    }
  }

  async getInvoicePDF(invoiceId: string): Promise<string | null> {
    try {
      const data = await this.makeRequest(`/invoices/${invoiceId}/pdf`);
      return data || null;
    } catch (error) {
      console.error('Error getting invoice PDF from Holded:', error);
      return null;
    }
  }

  // Sincronizar factura local con Holded
  async syncInvoiceToHolded(factura: any): Promise<string | null> {
    try {
      // Buscar o crear cliente en Holded
      let holdedCustomerId = null;
      
      if (factura.clientes) {
        const contacts = await this.getContacts();
        let customer = contacts.find(c => c.email === factura.clientes.email);
        
        if (!customer) {
          // Crear cliente en Holded
          const newCustomer = await this.createContact({
            name: factura.clientes.nombre,
            email: factura.clientes.email,
            phone: factura.clientes.telefono
          });
          
          if (newCustomer) {
            holdedCustomerId = newCustomer.id;
          }
        } else {
          holdedCustomerId = customer.id;
        }
      }

      // Crear factura en Holded
      const holdedInvoice = await this.createInvoice({
        number: factura.id,
        date: factura.fecha,
        dueDate: factura.fecha_vencimiento,
        customerId: holdedCustomerId,
        customerName: factura.clientes?.nombre || 'Cliente',
        total: parseFloat(factura.total),
        status: factura.estado === 'pagada' ? 'paid' : 'pending',
        items: [{
          name: factura.descripcion || 'Servicio',
          description: factura.descripcion,
          quantity: 1,
          price: parseFloat(factura.total),
          total: parseFloat(factura.total)
        }]
      });

      if (holdedInvoice) {
        // Actualizar factura local con el ID de Holded
        const { error } = await supabase
          .from('facturas')
          .update({ holded_id: holdedInvoice.id })
          .eq('id', factura.id);

        if (error) throw error;

        return holdedInvoice.id;
      }

      return null;
    } catch (error) {
      console.error('Error syncing invoice to Holded:', error);
      throw error;
    }
  }

  // Sincronizar todas las facturas locales con Holded
  async syncAllInvoices(): Promise<{ success: number; errors: number }> {
    try {
      const { data: facturas, error } = await supabase
        .from('facturas')
        .select(`
          *,
          clientes(nombre, email, telefono)
        `)
        .is('holded_id', null);

      if (error) throw error;

      let success = 0;
      let errors = 0;

      for (const factura of facturas || []) {
        try {
          await this.syncInvoiceToHolded(factura);
          success++;
        } catch (error) {
          console.error(`Error syncing invoice ${factura.id}:`, error);
          errors++;
        }
      }

      return { success, errors };
    } catch (error) {
      console.error('Error syncing all invoices:', error);
      throw error;
    }
  }
}

export const holdedService = new HoldedService();
export default holdedService;
