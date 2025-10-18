import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Download, Eye, RefreshCw, AlertCircle } from "lucide-react";
import holdedService from "@/services/holdedService";
import { toast } from "@/hooks/use-toast";

const HoldedInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await holdedService.getInvoices();
      
      if (result.success) {
        setInvoices(result.data || []);
        toast({
          title: "Facturas cargadas",
          description: `${result.data?.length || 0} facturas encontradas`,
        });
      } else {
        setError(result.error || "Error cargando facturas");
        toast({
          title: "Error cargando facturas",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error cargando facturas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const result = await holdedService.getInvoicePDF(invoiceId);
      
      if (result.success && result.data?.pdf_url) {
        window.open(result.data.pdf_url, '_blank');
      } else {
        toast({
          title: "Error",
          description: "No se pudo obtener el PDF de la factura",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const result = await holdedService.getInvoicePDF(invoiceId);
      
      if (result.success && result.data?.pdf_url) {
        // Crear un enlace temporal para descargar
        const link = document.createElement('a');
        link.href = result.data.pdf_url;
        link.download = `factura_${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: "Error",
          description: "No se pudo descargar el PDF de la factura",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facturas de Holded
            </CardTitle>
            <CardDescription>
              Gestiona y visualiza tus facturas sincronizadas con Holded
            </CardDescription>
          </div>
          <Button 
            onClick={loadInvoices} 
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando facturas...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span>{error}</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay facturas sincronizadas con Holded</p>
            <p className="text-sm">Las facturas aparecerán aquí cuando se sincronicen con Holded</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">¿Cómo sincronizar facturas?</p>
              <ol className="text-xs text-blue-700 mt-2 text-left space-y-1">
                <li>1. Ve a la pestaña "Facturas Locales"</li>
                <li>2. Crea una nueva factura o selecciona una existente</li>
                <li>3. Haz clic en "Sincronizar con Holded"</li>
                <li>4. Las facturas sincronizadas aparecerán aquí</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {invoices.length} factura{invoices.length !== 1 ? 's' : ''} encontrada{invoices.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invoice.type || 'invoice'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'draft' ? 'secondary' :
                          invoice.status === 'sent' ? 'outline' : 'secondary'
                        }
                      >
                        {invoice.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.customer || invoice.customer_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {invoice.amount ? `€${parseFloat(invoice.amount).toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoldedInvoices;
