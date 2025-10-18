import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Key, Building } from 'lucide-react';

const HoldedConfig = () => {
  const [apiKey, setApiKey] = useState('');
  const [companyId, setCompanyId] = useState('');
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
        .select('*')
        .eq('clave', 'holded_api_key')
        .single();

      if (data) {
        setApiKey(data.valor || '');
      }

      const { data: companyData, error: companyError } = await supabase
        .from('configuracion')
        .select('*')
        .eq('clave', 'holded_company_id')
        .single();

      if (companyData) {
        setCompanyId(companyData.valor || '');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const guardarConfiguracion = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "La API key es requerida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Guardar API key
      const { error: keyError } = await supabase
        .from('configuracion')
        .upsert({
          clave: 'holded_api_key',
          valor: apiKey.trim(),
          descripcion: 'API Key de Holded para facturación'
        });

      if (keyError) throw keyError;

      // Guardar Company ID si se proporciona
      if (companyId.trim()) {
        const { error: companyError } = await supabase
          .from('configuracion')
          .upsert({
            clave: 'holded_company_id',
            valor: companyId.trim(),
            descripcion: 'Company ID de Holded'
          });

        if (companyError) throw companyError;
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de Holded se ha guardado correctamente"
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
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Debes configurar la API key primero",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:3003/contacts?apiKey=' + encodeURIComponent(apiKey));
      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: `Conexión exitosa. Se encontraron ${result.data?.length || 0} contactos.`
        });
        toast({
          title: "Conexión exitosa",
          description: "La API key de Holded es válida"
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || result.data?.info || 'Error desconocido'
        });
        toast({
          title: "Error de conexión",
          description: result.error || result.data?.info || 'Error desconocido',
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
          Configuración de Holded
        </CardTitle>
        <CardDescription>
          Configura tu API key de Holded para habilitar la sincronización de facturas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key de Holded *
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Ingresa tu API key de Holded"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Puedes obtener tu API key desde el panel de Holded en Configuración → API
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company ID (opcional)
            </Label>
            <Input
              id="companyId"
              type="text"
              placeholder="ID de tu empresa en Holded"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Si tienes múltiples empresas, especifica el ID de la empresa a usar
            </p>
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
            disabled={loading || !apiKey.trim()}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          
          <Button
            onClick={probarConexion}
            disabled={testing || !apiKey.trim()}
            variant="outline"
            className="flex-1"
          >
            {testing ? 'Probando...' : 'Probar Conexión'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Nota:</strong> Para obtener tu API key de Holded:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Inicia sesión en tu cuenta de Holded</li>
            <li>Ve a Configuración → API</li>
            <li>Genera una nueva API key</li>
            <li>Copia la key y pégala aquí</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default HoldedConfig;