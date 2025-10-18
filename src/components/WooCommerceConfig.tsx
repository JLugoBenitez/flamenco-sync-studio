import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Globe, Key, TestTube } from 'lucide-react';

const WooCommerceConfig = () => {
  const [config, setConfig] = useState({
    woocommerce_url: '',
    woocommerce_consumer_key: '',
    woocommerce_consumer_secret: '',
    woocommerce_enabled: false,
    woocommerce_sync_products: true,
    woocommerce_sync_orders: true,
    woocommerce_sync_customers: true
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', [
          'woocommerce_url',
          'woocommerce_consumer_key',
          'woocommerce_consumer_secret',
          'woocommerce_enabled',
          'woocommerce_sync_products',
          'woocommerce_sync_orders',
          'woocommerce_sync_customers'
        ]);

      if (error) throw error;

      const configData: any = {};
      data?.forEach(item => {
        if (item.clave.includes('enabled') || item.clave.includes('sync_')) {
          configData[item.clave] = item.valor === 'true';
        } else {
          configData[item.clave] = item.valor || '';
        }
      });

      setConfig(configData);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const guardarConfiguracion = async () => {
    if (!config.woocommerce_url.trim() || !config.woocommerce_consumer_key.trim() || !config.woocommerce_consumer_secret.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const configuraciones = [
        { clave: 'woocommerce_url', valor: config.woocommerce_url.trim() },
        { clave: 'woocommerce_consumer_key', valor: config.woocommerce_consumer_key.trim() },
        { clave: 'woocommerce_consumer_secret', valor: config.woocommerce_consumer_secret.trim() },
        { clave: 'woocommerce_enabled', valor: config.woocommerce_enabled.toString() },
        { clave: 'woocommerce_sync_products', valor: config.woocommerce_sync_products.toString() },
        { clave: 'woocommerce_sync_orders', valor: config.woocommerce_sync_orders.toString() },
        { clave: 'woocommerce_sync_customers', valor: config.woocommerce_sync_customers.toString() }
      ];

      for (const configItem of configuraciones) {
        const { error } = await supabase
          .from('configuracion')
          .upsert({
            clave: configItem.clave,
            valor: configItem.valor,
            descripcion: `Configuración de WooCommerce: ${configItem.clave}`
          });

        if (error) throw error;
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de WooCommerce se ha guardado correctamente"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const probarConexion = async () => {
    if (!config.woocommerce_url.trim() || !config.woocommerce_consumer_key.trim() || !config.woocommerce_consumer_secret.trim()) {
      toast({
        title: "Error",
        description: "Debes configurar las credenciales primero",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:8000/functions/v1/woocommerce-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          action: 'test_connection',
          url: config.woocommerce_url,
          consumer_key: config.woocommerce_consumer_key,
          consumer_secret: config.woocommerce_consumer_secret
        })
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: `Conexión exitosa. Se encontraron ${result.data?.products?.length || 0} productos.`
        });
        toast({
          title: "Conexión exitosa",
          description: "WooCommerce está configurado correctamente"
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Error desconocido'
        });
        toast({
          title: "Error de conexión",
          description: result.error || 'Error desconocido',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message
      });
      toast({
        title: "Error de conexión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de WooCommerce
        </CardTitle>
        <CardDescription>
          Configura la conexión con tu tienda WordPress/WooCommerce
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="woocommerce_url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL de WordPress *
            </Label>
            <Input
              id="woocommerce_url"
              type="url"
              placeholder="https://tu-tienda.com"
              value={config.woocommerce_url}
              onChange={(e) => setConfig({ ...config, woocommerce_url: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              URL completa de tu sitio WordPress (sin /wp-json/wc/v3)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="woocommerce_consumer_key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Consumer Key *
            </Label>
            <Input
              id="woocommerce_consumer_key"
              type="text"
              placeholder="ck_1234567890abcdef"
              value={config.woocommerce_consumer_key}
              onChange={(e) => setConfig({ ...config, woocommerce_consumer_key: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Clave de consumidor de WooCommerce (WooCommerce → Configuración → Avanzado → API REST)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="woocommerce_consumer_secret" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Consumer Secret *
            </Label>
            <Input
              id="woocommerce_consumer_secret"
              type="password"
              placeholder="cs_1234567890abcdef"
              value={config.woocommerce_consumer_secret}
              onChange={(e) => setConfig({ ...config, woocommerce_consumer_secret: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Secreto de consumidor de WooCommerce
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Opciones de Sincronización</h3>
          
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="woocommerce_enabled">Habilitar WooCommerce</Label>
              <p className="text-sm text-muted-foreground">
                Activar la sincronización con WooCommerce
              </p>
            </div>
            <Switch
              id="woocommerce_enabled"
              checked={config.woocommerce_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, woocommerce_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="woocommerce_sync_products">Sincronizar Productos</Label>
              <p className="text-sm text-muted-foreground">
                Sincronizar productos entre sistemas
              </p>
            </div>
            <Switch
              id="woocommerce_sync_products"
              checked={config.woocommerce_sync_products}
              onCheckedChange={(checked) => setConfig({ ...config, woocommerce_sync_products: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="woocommerce_sync_orders">Sincronizar Pedidos</Label>
              <p className="text-sm text-muted-foreground">
                Sincronizar pedidos/encargos
              </p>
            </div>
            <Switch
              id="woocommerce_sync_orders"
              checked={config.woocommerce_sync_orders}
              onCheckedChange={(checked) => setConfig({ ...config, woocommerce_sync_orders: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="woocommerce_sync_customers">Sincronizar Clientes</Label>
              <p className="text-sm text-muted-foreground">
                Sincronizar información de clientes
              </p>
            </div>
            <Switch
              id="woocommerce_sync_customers"
              checked={config.woocommerce_sync_customers}
              onCheckedChange={(checked) => setConfig({ ...config, woocommerce_sync_customers: checked })}
            />
          </div>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertDescription>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={guardarConfiguracion}
            disabled={loading || !config.woocommerce_url.trim() || !config.woocommerce_consumer_key.trim() || !config.woocommerce_consumer_secret.trim()}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          
          <Button
            onClick={probarConexion}
            disabled={testing || !config.woocommerce_url.trim() || !config.woocommerce_consumer_key.trim() || !config.woocommerce_consumer_secret.trim()}
            variant="outline"
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Probando...' : 'Probar Conexión'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Nota:</strong> Para obtener las credenciales de WooCommerce:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Ve a tu WordPress → WooCommerce → Configuración</li>
            <li>Selecciona la pestaña "Avanzado"</li>
            <li>Haz clic en "API REST"</li>
            <li>Haz clic en "Añadir clave"</li>
            <li>Configura los permisos (Lectura/Escritura)</li>
            <li>Copia la Consumer Key y Consumer Secret</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default WooCommerceConfig;


