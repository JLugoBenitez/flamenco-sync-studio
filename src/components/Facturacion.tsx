import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download, DollarSign, FileText, CreditCard } from "lucide-react";

const Facturacion = () => {
  const facturas = [
    { id: "F-2025-001", cliente: "María González", fecha: "2025-10-10", vencimiento: "2025-11-10", total: 750, estado: "pagada", tipo: "factura" },
    { id: "F-2025-002", cliente: "Carmen Ruiz", fecha: "2025-10-11", vencimiento: "2025-11-11", total: 920, estado: "pendiente", tipo: "factura" },
    { id: "A-2025-023", cliente: "Ana Martínez", fecha: "2025-10-08", vencimiento: "-", total: 340, estado: "entregado", tipo: "albaran" },
    { id: "F-2025-003", cliente: "Isabel López", fecha: "2025-10-12", vencimiento: "2025-11-12", total: 680, estado: "vencida", tipo: "factura" },
    { id: "F-2025-004", cliente: "Rosa Fernández", fecha: "2025-10-13", vencimiento: "2025-11-13", total: 450, estado: "pendiente", tipo: "factura" },
    { id: "A-2025-024", cliente: "Lucía Morales", fecha: "2025-10-09", vencimiento: "-", total: 280, estado: "entregado", tipo: "albaran" }
  ];

  const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + f.total, 0);
  const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0);
  const totalVencido = facturas.filter(f => f.estado === 'vencida').reduce((sum, f) => sum + f.total, 0);

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Factura
        </Button>
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
            <div className="text-3xl font-bold text-green-600">{totalPagado}€</div>
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
            <div className="text-3xl font-bold text-yellow-600">{totalPendiente}€</div>
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
            <div className="text-3xl font-bold text-red-600">{totalVencido}€</div>
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell className="font-medium">{factura.id}</TableCell>
                  <TableCell>{getTipoBadge(factura.tipo)}</TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell>{new Date(factura.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{factura.vencimiento !== '-' ? new Date(factura.vencimiento).toLocaleDateString('es-ES') : '-'}</TableCell>
                  <TableCell className="text-right font-semibold">{factura.total}€</TableCell>
                  <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Facturacion;
