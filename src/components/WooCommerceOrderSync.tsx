import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapWooStatusToLocal, mapLocalStatusToWoo } from "@/lib/woocommerce-mappings";

interface WooCommerceOrderSyncProps {
  onSyncComplete?: () => void;
}

export const WooCommerceOrderSync = ({ onSyncComplete }: WooCommerceOrderSyncProps) => {
  const [syncing, setSyncing] = useState(false);
  const [syncingToWoo, setSyncingToWoo] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Usar función centralizada para mapeos consistentes

  // Usar función centralizada para mapeos consistentes

  const sincronizarPedidos = async () => {
    setSyncing(true);
    try {
      // Verificar usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No hay usuario autenticado');
      }
      console.log('Usuario autenticado:', user.email, 'ID:', user.id);

      // Obtener configuración de WooCommerce
      const { data: config, error: configError } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['woo_url', 'woo_key', 'woo_secret']);

      if (configError) {
        console.error('Error obteniendo configuración:', configError);
        throw configError;
      }
      if (!config || config.length < 3) {
        throw new Error('WooCommerce no está configurado. Ve a Configuración para agregar las credenciales.');
      }

      const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
      const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
      const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;

      if (!wooUrl || !wooKey || !wooSecret) {
        throw new Error('Faltan credenciales de WooCommerce');
      }

      // Obtener pedidos de WooCommerce
      const auth = btoa(`${wooKey}:${wooSecret}`);
      const response = await fetch(`${wooUrl}/wp-json/wc/v3/orders?per_page=100`, {
        headers: { 
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error de WooCommerce: ${response.statusText}`);
      }

      const wooOrders = await response.json();
      console.log(`Encontrados ${wooOrders.length} pedidos en WooCommerce`);
      let syncedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;

      // Sincronizar cada pedido
      for (const order of wooOrders) {
        try {
          // Buscar si ya existe localmente
          const { data: existing, error: selectError } = await supabase
            .from('encargos')
            .select('id, woo_order_id')
            .eq('woo_order_id', String(order.id))
            .maybeSingle();

          if (selectError) {
            console.error(`Error buscando pedido ${order.id}:`, selectError);
            continue;
          }

          // Construir descripción del pedido
          const items = order.line_items || [];
          const producto_descripcion = items
            .map((item: any) => `${item.name} x${item.quantity}`)
            .join(', ') || 'Pedido sin productos';

          // Buscar o crear cliente
          let cliente_id = null;
          if (order.billing?.email) {
            const { data: cliente } = await supabase
              .from('clientes')
              .select('id')
              .eq('email', order.billing.email)
              .maybeSingle();

            if (cliente) {
              cliente_id = cliente.id;
            } else {
              // Crear cliente si no existe
              const { data: nuevoCliente } = await supabase
                .from('clientes')
                .insert({
                  nombre: `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim() || 'Cliente WooCommerce',
                  email: order.billing.email,
                  telefono: order.billing.phone || null,
                  direccion: `${order.billing.address_1 || ''} ${order.billing.city || ''} ${order.billing.postcode || ''}`.trim() || null
                })
                .select('id')
                .single();

              if (nuevoCliente) {
                cliente_id = nuevoCliente.id;
              }
            }
          }

          const payload: any = {
            cliente_id,
            producto_descripcion,
            precio_total: parseFloat(order.total || '0'),
            estado: mapWooStatusToLocal(order.status),
            fecha_pedido: order.date_created || new Date().toISOString(),
            notas: order.customer_note || null,
            woo_order_id: String(order.id),
          };

          if (existing) {
            // Actualizar pedido existente
            const { error: updateError } = await supabase
              .from('encargos')
              .update(payload)
              .eq('id', existing.id);
            
            if (updateError) {
              console.error(`Error actualizando pedido ${order.id}:`, updateError);
              continue;
            }
            console.log(`✓ Actualizado: Pedido #${order.number}`);
            updatedCount++;
          } else {
            // Crear nuevo pedido
            const { error: insertError } = await supabase
              .from('encargos')
              .insert(payload);
            
            if (insertError) {
              console.error(`Error insertando pedido ${order.id}:`, insertError);
              continue;
            }
            console.log(`✓ Creado: Pedido #${order.number}`);
            createdCount++;
          }
          syncedCount++;
        } catch (err) {
          console.error(`Error procesando pedido ${order.id}:`, err);
        }
      }

      toast({
        title: "Sincronización de pedidos completada",
        description: `${syncedCount} pedidos sincronizados (${createdCount} nuevos, ${updatedCount} actualizados)`
      });
      setLastSync(new Date());
      
      // Refrescar la lista de encargos
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error en la sincronización",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const sincronizarHaciaWooCommerce = async () => {
    setSyncingToWoo(true);
    try {
      // Verificar usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No hay usuario autenticado');
      }

      // Obtener encargos locales que no tienen woo_order_id O que necesitan actualización
      const { data: encargosLocales, error: encargosError } = await supabase
        .from('encargos')
        .select('*, clientes(*)')
        .or('woo_order_id.is.null,precio_total.gt.0'); // Incluir todos los encargos con precio > 0

      if (encargosError) throw encargosError;

      if (!encargosLocales || encargosLocales.length === 0) {
        toast({
          title: "No hay encargos para sincronizar",
          description: "Todos los encargos ya están sincronizados con WooCommerce"
        });
        return;
      }

      // Obtener configuración de WooCommerce
      const { data: config } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['woo_url', 'woo_key', 'woo_secret']);

      if (!config || config.length < 3) {
        throw new Error('WooCommerce no está configurado');
      }

      const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
      const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
      const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;

      if (!wooUrl || !wooKey || !wooSecret) {
        throw new Error('Faltan credenciales de WooCommerce');
      }

      const auth = btoa(`${wooKey}:${wooSecret}`);
      let syncedCount = 0;

      for (const encargo of encargosLocales) {
        try {
          let wooCustomerId = null;
          let isUpdate = false;
          
          if (encargo.cliente_id && encargo.clientes) {
            const cliente = encargo.clientes;
            
            // Buscar cliente en WooCommerce
            const customerResponse = await fetch(`${wooUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(cliente.email)}`, {
              headers: { 'Authorization': `Basic ${auth}` }
            });

            if (customerResponse.ok) {
              const customers = await customerResponse.json();
              if (customers.length > 0) {
                wooCustomerId = customers[0].id;
              }
            }
          }

          // Usar función centralizada para mapeos consistentes

          const wooOrderPayload = {
            status: mapLocalStatusToWoo(encargo.estado),
            customer_note: encargo.notas || '',
            payment_method: 'manual',
            payment_method_title: 'Pago manual',
            set_paid: encargo.estado === 'entregado', // Marcar como pagado si está entregado
            line_items: [
              {
                name: encargo.producto_descripcion,
                quantity: 1,
                price: parseFloat(encargo.precio_total),
                sku: `custom-${encargo.id}`,
                product_id: 0,
                total: (parseFloat(encargo.precio_total) * 1).toFixed(2)
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
            total: parseFloat(encargo.precio_total).toFixed(2),
            currency: 'EUR'
          };

          if (wooCustomerId) {
            wooOrderPayload.customer_id = wooCustomerId;
          }

          // Datos de facturación
          const cliente = encargo.clientes;
          const firstName = cliente?.nombre?.split(' ')[0] || 'Cliente';
          const lastName = cliente?.nombre?.split(' ').slice(1).join(' ') || 'App';
          
          wooOrderPayload.billing = {
            first_name: firstName,
            last_name: lastName,
            email: cliente?.email || 'noreply@example.com',
            phone: cliente?.telefono || '',
            address_1: cliente?.direccion || '',
            city: '',
            postcode: '',
            country: 'ES'
          };

          wooOrderPayload.shipping = {
            first_name: firstName,
            last_name: lastName,
            address_1: cliente?.direccion || '',
            city: '',
            postcode: '',
            country: 'ES'
          };

          // Determinar si es actualización o creación
          let orderResponse;
          if (encargo.woo_order_id) {
            // Actualizar pedido existente
            orderResponse = await fetch(`${wooUrl}/wp-json/wc/v3/orders/${encargo.woo_order_id}`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(wooOrderPayload)
            });
            isUpdate = true;
          } else {
            // Crear nuevo pedido
            orderResponse = await fetch(`${wooUrl}/wp-json/wc/v3/orders`, {
              method: 'POST',
              headers: { 
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(wooOrderPayload)
            });
          }

          if (orderResponse.ok) {
            const wooOrder = await orderResponse.json();
            
            if (!isUpdate) {
              // Solo actualizar woo_order_id si es un pedido nuevo
              await supabase
                .from('encargos')
                .update({ woo_order_id: String(wooOrder.id) })
                .eq('id', encargo.id);
            }
            
            syncedCount++;
            const action = isUpdate ? 'actualizado' : 'sincronizado';
            console.log(`✓ Encargo #${encargo.id} ${action} con WooCommerce: #${wooOrder.number}`);
          } else {
            const errorText = await orderResponse.text();
            console.error(`Error ${isUpdate ? 'actualizando' : 'creando'} pedido para encargo ${encargo.id}:`, errorText);
          }
        } catch (error) {
          console.error(`Error sincronizando encargo ${encargo.id}:`, error);
        }
      }

      toast({
        title: "Sincronización hacia WooCommerce completada",
        description: `${syncedCount} encargos procesados (creados y/o actualizados)`
      });
    } catch (error: any) {
      toast({
        title: "Error en la sincronización",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncingToWoo(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Sincronización de Pedidos WooCommerce
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sincroniza los pedidos entre WooCommerce y tu aplicación
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={sincronizarPedidos} 
            disabled={syncing}
            className="w-full gap-2"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sincronizando desde WooCommerce...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sincronizar desde WooCommerce
              </>
            )}
          </Button>
          
          <Button 
            onClick={sincronizarHaciaWooCommerce} 
            disabled={syncingToWoo}
            variant="outline"
            className="w-full gap-2"
          >
            {syncingToWoo ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Enviando a WooCommerce...
              </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Actualizar/Crear en WooCommerce
                </>
              )}
          </Button>
        </div>

        {lastSync && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Última sincronización: {lastSync.toLocaleString('es-ES')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

