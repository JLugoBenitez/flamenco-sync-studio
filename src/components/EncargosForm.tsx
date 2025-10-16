import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapLocalStatusToWoo } from "@/lib/woocommerce-mappings";

interface EncargosFormProps {
  onSuccess: () => void;
  encargo?: any;
  trigger?: React.ReactNode;
}

export const EncargosForm = ({ onSuccess, encargo, trigger }: EncargosFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_id: encargo?.cliente_id || "",
    producto_descripcion: encargo?.producto_descripcion || "",
    precio_total: encargo?.precio_total?.toString() || "",
    estado: encargo?.estado || "pendiente",
    fecha_pedido: encargo?.fecha_pedido ? new Date(encargo.fecha_pedido).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    fecha_entrega: encargo?.fecha_entrega ? new Date(encargo.fecha_entrega).toISOString().split('T')[0] : "",
    notas: encargo?.notas || "",
    woo_order_id: encargo?.woo_order_id || null
  });

  useEffect(() => {
    if (open) cargarClientes();
  }, [open]);

  useEffect(() => {
    if (encargo) {
      setFormData({
        cliente_id: encargo.cliente_id || "",
        producto_descripcion: encargo.producto_descripcion || "",
        precio_total: encargo.precio_total?.toString() || "",
        estado: encargo.estado || "pendiente",
        fecha_pedido: encargo.fecha_pedido ? new Date(encargo.fecha_pedido).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_entrega: encargo.fecha_entrega ? new Date(encargo.fecha_entrega).toISOString().split('T')[0] : "",
        notas: encargo.notas || "",
        woo_order_id: encargo.woo_order_id || null
      });
    }
  }, [encargo]);

  const cargarClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").order("nombre");
    if (data) setClientes(data);
  };

  const syncToWooCommerce = async (encargoData: any, isNewOrder: boolean = false) => {
    try {
      const { data: config } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['woo_url', 'woo_key', 'woo_secret']);

      if (!config || config.length < 3) return;

      const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
      const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
      const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;

      if (!wooUrl || !wooKey || !wooSecret) return;

          // Usar función centralizada para mapeos consistentes

      const auth = btoa(`${wooKey}:${wooSecret}`);

      if (encargoData.woo_order_id) {
        // Actualizar pedido existente en WooCommerce
        const wooPayload = {
          status: mapLocalStatusToWoo(encargoData.estado),
          customer_note: encargoData.notas || ''
        };

        await fetch(`${wooUrl}/wp-json/wc/v3/orders/${encargoData.woo_order_id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wooPayload)
        });
      } else if (isNewOrder) {
        // Crear nuevo pedido en WooCommerce
        let wooCustomerId = null;
        
        // Obtener datos del cliente si existe
        if (encargoData.cliente_id) {
          const { data: cliente } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', encargoData.cliente_id)
            .single();

          if (cliente) {
            // Buscar o crear cliente en WooCommerce
            const customerResponse = await fetch(`${wooUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(cliente.email)}`, {
              headers: { 'Authorization': `Basic ${auth}` }
            });

            if (customerResponse.ok) {
              const customers = await customerResponse.json();
              if (customers.length > 0) {
                wooCustomerId = customers[0].id;
              } else {
                // Crear cliente en WooCommerce
                const newCustomerResponse = await fetch(`${wooUrl}/wp-json/wc/v3/customers`, {
                  method: 'POST',
                  headers: { 
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    email: cliente.email,
                    first_name: cliente.nombre.split(' ')[0] || '',
                    last_name: cliente.nombre.split(' ').slice(1).join(' ') || '',
                    phone: cliente.telefono || '',
                    billing: {
                      first_name: cliente.nombre.split(' ')[0] || '',
                      last_name: cliente.nombre.split(' ').slice(1).join(' ') || '',
                      email: cliente.email,
                      phone: cliente.telefono || '',
                      address_1: cliente.direccion || '',
                      city: '',
                      postcode: '',
                      country: 'ES'
                    }
                  })
                });

                if (newCustomerResponse.ok) {
                  const newCustomer = await newCustomerResponse.json();
                  wooCustomerId = newCustomer.id;
                }
              }
            }
          }
        }

        // Crear pedido en WooCommerce con formato completo
        const wooOrderPayload: any = {
          status: mapLocalStatusToWoo(encargoData.estado),
          customer_note: encargoData.notas || '',
          payment_method: 'manual',
          payment_method_title: 'Pago manual',
          set_paid: encargoData.estado === 'entregado', // Marcar como pagado si está entregado
          line_items: [
            {
              name: encargoData.producto_descripcion,
              quantity: 1,
              price: parseFloat(encargoData.precio_total),
              sku: `custom-${encargoData.id}`, // SKU único para productos personalizados
              product_id: 0, // Producto personalizado
              total: (parseFloat(encargoData.precio_total) * 1).toFixed(2) // Total del item
            }
          ],
          shipping_lines: [
            {
              method_title: 'Recogida local',
              method_id: 'local_pickup',
              total: '0.00'
            }
          ],
          fee_lines: [],
          coupon_lines: [],
          total: parseFloat(encargoData.precio_total).toFixed(2), // Total del pedido
          currency: 'EUR'
        };

        // Agregar customer_id solo si existe
        if (wooCustomerId) {
          wooOrderPayload.customer_id = wooCustomerId;
        }

        // Obtener datos del cliente para facturación
        let clienteData = null;
        if (encargoData.cliente_id) {
          const { data: cliente } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', encargoData.cliente_id)
            .single();
          clienteData = cliente;
        }

        // Datos de facturación (usar datos reales del cliente si existen)
        const firstName = clienteData?.nombre?.split(' ')[0] || 'Cliente';
        const lastName = clienteData?.nombre?.split(' ').slice(1).join(' ') || 'App';
        
        wooOrderPayload.billing = {
          first_name: firstName,
          last_name: lastName,
          email: clienteData?.email || 'noreply@example.com',
          phone: clienteData?.telefono || '',
          address_1: clienteData?.direccion || '',
          city: '',
          postcode: '',
          country: 'ES'
        };

        // Datos de envío (copiar de facturación)
        wooOrderPayload.shipping = {
          first_name: firstName,
          last_name: lastName,
          address_1: clienteData?.direccion || '',
          city: '',
          postcode: '',
          country: 'ES'
        };

        console.log('Enviando pedido a WooCommerce:', JSON.stringify(wooOrderPayload, null, 2));

        const orderResponse = await fetch(`${wooUrl}/wp-json/wc/v3/orders`, {
          method: 'POST',
          headers: { 
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wooOrderPayload)
        });

        if (orderResponse.ok) {
          const wooOrder = await orderResponse.json();
          // Actualizar el encargo local con el woo_order_id
          await supabase
            .from('encargos')
            .update({ woo_order_id: String(wooOrder.id) })
            .eq('id', encargoData.id);
          
          console.log(`✓ Pedido creado en WooCommerce: #${wooOrder.number}`);
        } else {
          const errorText = await orderResponse.text();
          console.error(`Error creando pedido en WooCommerce (${orderResponse.status}):`, errorText);
        }
      }
    } catch (error) {
      console.error('Error sincronizando con WooCommerce:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        cliente_id: formData.cliente_id || null,
        producto_descripcion: formData.producto_descripcion,
        precio_total: parseFloat(formData.precio_total),
        estado: formData.estado,
        fecha_pedido: formData.fecha_pedido ? new Date(formData.fecha_pedido).toISOString() : new Date().toISOString(),
        fecha_entrega: formData.fecha_entrega ? new Date(formData.fecha_entrega).toISOString() : null,
        notas: formData.notas || null
      };

      let result;
      if (encargo?.id) {
        // Actualizar encargo existente
        const { data, error } = await supabase
          .from("encargos")
          .update(payload)
          .eq('id', encargo.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        toast({ title: "Encargo actualizado correctamente" });
      } else {
        // Crear nuevo encargo
        const { data, error } = await supabase
          .from("encargos")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast({ title: "Encargo creado correctamente" });
      }

      // Sincronizar con WooCommerce
      if (result) {
        if (formData.woo_order_id) {
          // Actualizar pedido existente en WooCommerce
          syncToWooCommerce({ ...result, woo_order_id: formData.woo_order_id }, false);
        } else {
          // Crear nuevo pedido en WooCommerce (tanto para nuevos como para actualizaciones sin woo_order_id)
          syncToWooCommerce(result, true);
        }
      }

      setOpen(false);
      setFormData({ cliente_id: "", producto_descripcion: "", precio_total: "", estado: "pendiente", fecha_pedido: new Date().toISOString().split('T')[0], fecha_entrega: "", notas: "", woo_order_id: null });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Encargo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{encargo?.id ? 'Editar Encargo' : 'Añadir Nuevo Encargo'}</DialogTitle>
          <DialogDescription className="sr-only">Rellena los datos del encargo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio">Precio Total (€) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio_total}
                onChange={(e) => setFormData({ ...formData, precio_total: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_produccion">En Producción</SelectItem>
                  <SelectItem value="listo">Listo para Entrega</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_pedido">Fecha de Pedido</Label>
              <Input
                id="fecha_pedido"
                type="date"
                value={formData.fecha_pedido}
                onChange={(e) => setFormData({ ...formData, fecha_pedido: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
              <Input
                id="fecha_entrega"
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="producto">Descripción del Producto *</Label>
            <Textarea
              id="producto"
              value={formData.producto_descripcion}
              onChange={(e) => setFormData({ ...formData, producto_descripcion: e.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : (encargo?.id ? "Actualizar Encargo" : "Guardar Encargo")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
