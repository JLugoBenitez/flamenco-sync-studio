import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, RefreshCw, Users, Package, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import holdedService from "@/services/holdedService";
import { toast } from "@/hooks/use-toast";

const HoldedSync = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [results, setResults] = useState<any>(null);

  const syncClients = async () => {
    try {
      setCurrentAction("Obteniendo clientes de la base de datos...");
      setProgress(20);

      // Obtener clientes de la base de datos
      const { data: clientes, error: clientesError } = await supabase
        .from("clientes")
        .select("*");

      if (clientesError) throw clientesError;

      setCurrentAction(`Sincronizando ${clientes?.length || 0} clientes con Holded...`);
      setProgress(40);

      const syncResults = {
        total: clientes?.length || 0,
        success: 0,
        errors: 0,
        details: [] as any[]
      };

      // Sincronizar cada cliente
      for (let i = 0; i < (clientes?.length || 0); i++) {
        const cliente = clientes![i];
        setCurrentAction(`Sincronizando cliente: ${cliente.nombre}...`);
        setProgress(40 + (i / (clientes?.length || 1)) * 40);

        try {
          // Crear contacto en Holded
          const contactData = {
            name: cliente.nombre,
            email: cliente.email || "",
            phone: cliente.telefono || "",
            address: cliente.direccion || "",
            city: cliente.ciudad || "",
            postalCode: cliente.codigo_postal || "",
            country: cliente.pais || "España",
            vatNumber: cliente.cif || "",
            notes: `Cliente sincronizado desde Flamenco Sync Studio - ID: ${cliente.id}`
          };

          const result = await holdedService.createContact(contactData);
          
          if (result && result.success) {
            syncResults.success++;
            syncResults.details.push({
              type: "success",
              message: `Cliente ${cliente.nombre} sincronizado correctamente`,
              data: result.data
            });
          } else {
            syncResults.errors++;
            const errorMessage = result?.error || result?.message || "Error desconocido";
            syncResults.details.push({
              type: "error",
              message: `Error sincronizando ${cliente.nombre}: ${errorMessage}`,
              data: result
            });
          }
        } catch (error: any) {
          syncResults.errors++;
          syncResults.details.push({
            type: "error",
            message: `Error sincronizando ${cliente.nombre}: ${error.message || error}`,
            data: { error: error.toString(), stack: error.stack }
          });
        }
      }

      setProgress(80);
      setCurrentAction("Sincronización de clientes completada");
      setProgress(100);

      return syncResults;
    } catch (error: any) {
      throw new Error(`Error en sincronización de clientes: ${error.message}`);
    }
  };

  const syncProducts = async () => {
    try {
      setCurrentAction("Obteniendo productos de la base de datos...");
      setProgress(20);

      // Obtener productos de la base de datos
      const { data: productos, error: productosError } = await supabase
        .from("productos")
        .select("*");

      if (productosError) throw productosError;

      setCurrentAction(`Sincronizando ${productos?.length || 0} productos con Holded...`);
      setProgress(40);

      const syncResults = {
        total: productos?.length || 0,
        success: 0,
        errors: 0,
        details: [] as any[]
      };

      // Sincronizar cada producto
      for (let i = 0; i < (productos?.length || 0); i++) {
        const producto = productos![i];
        setCurrentAction(`Sincronizando producto: ${producto.nombre}...`);
        setProgress(40 + (i / (productos?.length || 1)) * 40);

        try {
          // Crear producto en Holded
          const productData = {
            name: producto.nombre,
            description: producto.descripcion || "",
            price: parseFloat(producto.precio) || 0,
            cost: parseFloat(producto.costo) || 0,
            stock: parseInt(producto.stock) || 0,
            sku: producto.sku || `SKU-${producto.id}`,
            category: producto.categoria || "Trajes de Flamenca",
            notes: `Producto sincronizado desde Flamenco Sync Studio - ID: ${producto.id}`
          };

          const result = await holdedService.createProduct(productData);
          
          if (result && result.success) {
            syncResults.success++;
            syncResults.details.push({
              type: "success",
              message: `Producto ${producto.nombre} sincronizado correctamente`,
              data: result.data
            });
          } else {
            syncResults.errors++;
            const errorMessage = result?.error || result?.message || "Error desconocido";
            syncResults.details.push({
              type: "error",
              message: `Error sincronizando ${producto.nombre}: ${errorMessage}`,
              data: result
            });
          }
        } catch (error: any) {
          syncResults.errors++;
          syncResults.details.push({
            type: "error",
            message: `Error sincronizando ${producto.nombre}: ${error.message || error}`,
            data: { error: error.toString(), stack: error.stack }
          });
        }
      }

      setProgress(80);
      setCurrentAction("Sincronización de productos completada");
      setProgress(100);

      return syncResults;
    } catch (error: any) {
      throw new Error(`Error en sincronización de productos: ${error.message}`);
    }
  };

  const loadInvoices = async () => {
    try {
      setCurrentAction("Cargando facturas de Holded...");
      setProgress(50);

      const result = await holdedService.getInvoices();
      
      setProgress(100);
      setCurrentAction("Facturas cargadas");

      return result;
    } catch (error: any) {
      throw new Error(`Error cargando facturas: ${error.message}`);
    }
  };

  const handleFullSync = async () => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      const syncResults = {
        clients: null as any,
        products: null as any,
        invoices: null as any
      };

      // Sincronizar clientes
      setCurrentAction("Iniciando sincronización completa...");
      syncResults.clients = await syncClients();
      
      // Sincronizar productos
      setCurrentAction("Sincronizando productos...");
      setProgress(0);
      syncResults.products = await syncProducts();
      
      // Cargar facturas
      setCurrentAction("Cargando facturas...");
      setProgress(0);
      syncResults.invoices = await loadInvoices();

      setResults(syncResults);
      setCurrentAction("Sincronización completa finalizada");
      
      toast({
        title: "Sincronización completada",
        description: `Clientes: ${syncResults.clients.success}/${syncResults.clients.total}, Productos: ${syncResults.products.success}/${syncResults.products.total}`,
      });
    } catch (error: any) {
      toast({
        title: "Error en sincronización",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentAction("");
    }
  };

  const handleSyncClients = async () => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      const syncResults = await syncClients();
      setResults({ clients: syncResults });
      
      toast({
        title: "Clientes sincronizados",
        description: `${syncResults.success}/${syncResults.total} clientes sincronizados correctamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error sincronizando clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentAction("");
    }
  };

  const handleSyncProducts = async () => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      const syncResults = await syncProducts();
      setResults({ products: syncResults });
      
      toast({
        title: "Productos sincronizados",
        description: `${syncResults.success}/${syncResults.total} productos sincronizados correctamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error sincronizando productos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentAction("");
    }
  };

  const handleLoadInvoices = async () => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      const invoices = await loadInvoices();
      setResults({ invoices });
      
      toast({
        title: "Facturas cargadas",
        description: `${invoices.data?.length || 0} facturas encontradas`,
      });
    } catch (error: any) {
      toast({
        title: "Error cargando facturas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentAction("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sincronización con Holded
          </CardTitle>
          <CardDescription>
            Sincroniza tus clientes, productos y facturas con Holded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botones de acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={handleSyncClients} 
              disabled={loading}
              className="w-full"
            >
              <Users className="mr-2 h-4 w-4" />
              Sincronizar Clientes
            </Button>
            
            <Button 
              onClick={handleSyncProducts} 
              disabled={loading}
              className="w-full"
            >
              <Package className="mr-2 h-4 w-4" />
              Sincronizar Productos
            </Button>
            
            <Button 
              onClick={handleLoadInvoices} 
              disabled={loading}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Cargar Facturas
            </Button>
            
            <Button 
              onClick={handleFullSync} 
              disabled={loading}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronización Completa
            </Button>
          </div>

          {/* Progreso */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentAction}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Resultados */}
          {results && (
            <div className="space-y-4">
              <h4 className="font-medium">Resultados de la Sincronización:</h4>
              
              {/* Clientes */}
              {results.clients && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Clientes</span>
                    <Badge variant={results.clients.success > 0 ? "default" : "secondary"}>
                      {results.clients.success}/{results.clients.total}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {results.clients.success} sincronizados correctamente, {results.clients.errors} errores
                  </div>
                </div>
              )}

              {/* Productos */}
              {results.products && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Productos</span>
                    <Badge variant={results.products.success > 0 ? "default" : "secondary"}>
                      {results.products.success}/{results.products.total}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {results.products.success} sincronizados correctamente, {results.products.errors} errores
                  </div>
                </div>
              )}

              {/* Facturas */}
              {results.invoices && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Facturas</span>
                    <Badge variant="secondary">
                      {results.invoices.data?.length || 0} encontradas
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {results.invoices.message || "Facturas cargadas correctamente"}
                  </div>
                </div>
              )}

              {/* Detalles de errores */}
              {results.clients?.details && results.clients.details.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Detalles de Clientes:</h5>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.clients.details.map((detail: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {detail.type === "success" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={detail.type === "error" ? "text-red-600" : "text-green-600"}>
                          {detail.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.products?.details && results.products.details.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Detalles de Productos:</h5>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.products.details.map((detail: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {detail.type === "success" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={detail.type === "error" ? "text-red-600" : "text-green-600"}>
                          {detail.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HoldedSync;
