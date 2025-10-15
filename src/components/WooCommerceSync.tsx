import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const WooCommerceSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const sincronizarProductos = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("woocommerce-sync", {
        body: { action: "sync_products" },
      });

      if (error) throw error;

      toast({ 
        title: "Sincronización completada", 
        description: `${data.synced || 0} productos sincronizados correctamente` 
      });
      setLastSync(new Date());
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