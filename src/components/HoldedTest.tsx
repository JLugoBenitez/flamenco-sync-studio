import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import holdedService from "@/services/holdedService";

const HoldedTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testHoldedConnection = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const connectionTest = await holdedService.testConnection();
      const contactsTest = await holdedService.getContacts();
      const productsTest = await holdedService.getProducts();
      const invoicesTest = await holdedService.getInvoices();

      setResults({
        connection: connectionTest,
        contacts: contactsTest,
        products: productsTest,
        invoices: invoicesTest
      });
    } catch (error) {
      setResults({
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Prueba de Conexión Holded
        </CardTitle>
        <CardDescription>
          Verifica que la integración con Holded esté funcionando correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testHoldedConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Probando conexión...
            </>
          ) : (
            "Probar Conexión con Holded"
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <h4 className="font-medium">Resultados de la Prueba:</h4>
            
            {/* Conexión */}
            <div className="flex items-center gap-2">
              {results.connection?.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                <strong>Conexión:</strong> {results.connection?.success ? "Exitosa" : "Fallida"}
              </span>
            </div>

            {/* Contactos */}
            <div className="flex items-center gap-2">
              {results.contacts?.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                <strong>Contactos:</strong> {results.contacts?.success ? "OK" : "Error"}
              </span>
              {results.contacts?.data && (
                <Badge variant="secondary">
                  {Array.isArray(results.contacts.data) ? results.contacts.data.length : 0} contactos
                </Badge>
              )}
            </div>

            {/* Productos */}
            <div className="flex items-center gap-2">
              {results.products?.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                <strong>Productos:</strong> {results.products?.success ? "OK" : "Error"}
              </span>
              {results.products?.data && (
                <Badge variant="secondary">
                  {Array.isArray(results.products.data) ? results.products.data.length : 0} productos
                </Badge>
              )}
            </div>

            {/* Facturas */}
            <div className="flex items-center gap-2">
              {results.invoices?.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                <strong>Facturas:</strong> {results.invoices?.success ? "OK (Simulado)" : "Error"}
              </span>
              {results.invoices?.data && (
                <Badge variant="secondary">
                  {Array.isArray(results.invoices.data) ? results.invoices.data.length : 0} facturas
                </Badge>
              )}
              {results.invoices?.message && (
                <Badge variant="outline" className="text-xs">
                  {results.invoices.message}
                </Badge>
              )}
            </div>

            {/* Error */}
            {results.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {results.error.message || "Error desconocido"}
                </p>
              </div>
            )}

            {/* Configuración */}
            {results.connection?.config && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  <strong>API Key:</strong> {results.connection.config.apiKey?.substring(0, 8)}...
                </p>
                <p className="text-sm text-blue-600">
                  <strong>Company ID:</strong> {results.connection.config.companyId}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoldedTest;
