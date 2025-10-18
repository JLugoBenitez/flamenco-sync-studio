import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface WooCommerceSyncProps {
  onSyncComplete?: () => void;
}

export const WooCommerceSync = ({ onSyncComplete }: WooCommerceSyncProps) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const sincronizarProductos = async () => {
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

      // Obtener productos de WooCommerce
      const auth = btoa(`${wooKey}:${wooSecret}`);
      const response = await fetch(`${wooUrl}/wp-json/wc/v3/products?per_page=100`, {
        headers: { 
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error de WooCommerce: ${response.statusText}`);
      }

      const wooProducts = await response.json();
      console.log(`Encontrados ${wooProducts.length} productos en WooCommerce`);
      let syncedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;

      // Sincronizar cada producto
      for (const wp of wooProducts) {
        try {
          // Buscar si ya existe localmente
          const { data: existing, error: selectError } = await supabase
            .from('productos')
            .select('id, woo_product_id')
            .eq('woo_product_id', String(wp.id))
            .maybeSingle();

          if (selectError) {
            console.error(`Error buscando producto ${wp.id}:`, selectError);
            continue;
          }

          // WooCommerce devuelve null cuando no gestiona stock, tratarlo como disponible
          const stock = wp.stock_quantity !== null && wp.stock_quantity !== undefined 
            ? wp.stock_quantity 
            : (wp.stock_status === 'instock' ? 999 : 0);

          const payload: any = {
            nombre: wp.name,
            precio: parseFloat(wp.price || '0'),
            stock: stock,
            descripcion: wp.description || null,
            imagen_url: wp.images?.[0]?.src || null,
            categoria: wp.categories?.[0]?.name || 'General',
            talla: wp.attributes?.find((a: any) => a.name === 'Talla')?.options?.[0] || 'Única',
            woo_product_id: String(wp.id),
          };

          if (existing) {
            // Actualizar producto existente
            const { error: updateError } = await supabase
              .from('productos')
              .update(payload)
              .eq('id', existing.id);
            
            if (updateError) {
              console.error(`Error actualizando producto ${wp.id}:`, updateError);
              continue;
            }
            console.log(`✓ Actualizado: ${wp.name}`);
            updatedCount++;
          } else {
            // Crear nuevo producto
            const { error: insertError } = await supabase
              .from('productos')
              .insert(payload);
            
            if (insertError) {
              console.error(`Error insertando producto ${wp.id}:`, insertError);
              continue;
            }
            console.log(`✓ Creado: ${wp.name}`);
            createdCount++;
          }
          syncedCount++;
        } catch (err) {
          console.error(`Error procesando producto ${wp.id}:`, err);
        }
      }

      toast({
        title: "Sincronización completada",
        description: `${syncedCount} productos sincronizados (${createdCount} nuevos, ${updatedCount} actualizados)`
      });
      setLastSync(new Date());
      
      // Refrescar la lista de productos
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

  // Comentado el auto-sync para evitar errores sin configuración
  // useEffect(() => {
  //   sincronizarProductos();
  //   const id = setInterval(sincronizarProductos, 15 * 60 * 1000);
  //   return () => clearInterval(id);
  // }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Sincronización WooCommerce
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sincroniza tus productos entre la aplicación y tu tienda WooCommerce
        </p>
        
        <Button 
          onClick={sincronizarProductos} 
          disabled={syncing}
          className="w-full gap-2"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sincronizar Ahora
            </>
          )}
        </Button>

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