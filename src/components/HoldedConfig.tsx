import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  Building, 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const HoldedConfig = () => {
  const [config, setConfig] = useState({
    holded_api_key: '',
    holded_company_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['holded_api_key', 'holded_company_id']);

      if (error) throw error;

      const configMap = data?.reduce((acc, item) => {
        acc[item.clave] = item.valor || '';
        return acc;
      }, {} as Record<string, string>) || {};

      setConfig({
        holded_api_key: configMap.holded_api_key || '',
        holded_company_id: configMap.holded_company_id || ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Actualizar API key
      const { error: keyError } = await supabase
        .from('configuracion')
        .upsert({
          clave: 'holded_api_key',
          valor: config.holded_api_key
        });

      if (keyError) throw keyError;

      // Actualizar Company ID
      const { error: companyError } = await supabase
        .from('configuracion')
        .upsert({
          clave: 'holded_company_id',
          valor: config.holded_company_id
        });

      if (companyError) throw companyError;

      toast({
        title: 'Configuración guardada',
        description: 'La configuración de Holded se ha guardado correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('holded-sync', {
        body: { action: 'get_contacts' }
      });

      if (error) throw error;

      setTestResult({
        success: true,
        message: `Conexión exitosa. Se encontraron ${data?.contacts?.length || 0} contactos.`
      });

      toast({
        title: 'Conexión exitosa',
        description: 'La conexión con Holded funciona correctamente'
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Error desconocido'
      });

      toast({
        title: 'Error de conexión',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configuración de Holded
        </h2>
        <p className="text-muted-foreground mt-2">
          Configura tu integración con Holded para facturación y contabilidad
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5 text-primary" />
            Credenciales de API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key de Holded</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Tu API key de Holded"
                value={config.holded_api_key}
                onChange={(e) => setConfig(prev => ({ ...prev, holded_api_key: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Obtén tu API key desde el panel de Holded
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Company ID (Opcional)</Label>
              <Input
                id="company_id"
                type="text"
                placeholder="ID de tu empresa en Holded"
                value={config.holded_company_id}
                onChange={(e) => setConfig(prev => ({ ...prev, holded_company_id: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                ID de la empresa para facturación específica
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={saveConfig} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>

            <Button 
              variant="outline" 
              onClick={testConnection} 
              disabled={testing || !config.holded_api_key}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {testResult.success ? 'Conexión exitosa' : 'Error de conexión'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {testResult.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building className="h-5 w-5 text-primary" />
            Información de Holded
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-foreground mb-2">¿Qué es Holded?</h4>
              <p className="text-sm text-muted-foreground">
                Holded es una plataforma de gestión empresarial que incluye facturación, 
                contabilidad, CRM y gestión de proyectos.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Funcionalidades</h4>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Facturación automática</Badge>
                <Badge variant="outline" className="text-xs">Gestión de contactos</Badge>
                <Badge variant="outline" className="text-xs">Sincronización de datos</Badge>
                <Badge variant="outline" className="text-xs">Reportes contables</Badge>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="gap-2" asChild>
              <a 
                href="https://www.holded.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Visitar Holded
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HoldedConfig;
