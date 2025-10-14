import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, FileText, CreditCard, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Facturacion = () => {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("facturas")
      .select(`
        *,
        clientes(nombre)
      `)
      .order("fecha", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setFacturas(data || []);
    }
    setLoading(false);
  };

  const sincronizarHolded = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("holded-sync", {
        body: { action: "get_invoices" },
      });

      if (error) throw error;

      toast({ 
        title: "Sincronización completada",
        description: `${data?.invoices?.length || 0} facturas sincronizadas con Holded`
      });
      cargarFacturas();
    } catch (error: any) {
      toast({
        title: "Error al sincronizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + parseFloat(f.total.toString()), 0);
  const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + parseFloat(f.total.toString()), 0);
  const totalVencido = facturas.filter(f => f.estado === 'vencida').reduce((sum, f) => sum + parseFloat(f.total.toString()), 0);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagada":
        return <Badge className="bg-green-600">Pagada</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-600">Pendiente</Badge>;
      case "vencida":
        return <Badge variant="destructive">Vencida</Badge>;
      case "entregado":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Entregado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'factura' ? (
      <Badge variant="secondary">Factura</Badge>
    ) : (
      <Badge variant="outline">Albarán</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Facturación
          </h1>
          <p className="text-muted-foreground mt-2">
            Facturas, albaranes y control de cobros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={sincronizarHolded} disabled={syncing}>
            <Send className="h-4 w-4" />
            {syncing ? "Sincronizando..." : "Sincronizar Holded"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              Total Cobrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalPagado.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              Pendiente de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalPendiente.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">{facturas.filter(f => f.estado === 'pendiente').length} facturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              Facturas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalVencido.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">{facturas.filter(f => f.estado === 'vencida').length} facturas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facturas y Albaranes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando facturas...
                  </TableCell>
                </TableRow>
              ) : facturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay facturas registradas
                  </TableCell>
                </TableRow>
              ) : (
                facturas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell className="font-medium">{factura.id}</TableCell>
                    <TableCell>{getTipoBadge(factura.tipo)}</TableCell>
                    <TableCell>{factura.clientes?.nombre || "N/A"}</TableCell>
                    <TableCell>{new Date(factura.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      {factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES') : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{parseFloat(factura.total).toFixed(2)}€</TableCell>
                    <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Facturacion;
