import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  DollarSign, 
  FileText, 
  CreditCard, 
  Send, 
  Settings,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import HoldedConfig from "./HoldedConfig";
import FacturaView from "./FacturaView";
import holdedService from "@/services/holdedService";

const Facturacion = () => {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'factura',
    cliente_id: '',
    total: '',
    descripcion: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    cargarFacturas();
    cargarClientes();
  }, []);

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("facturas")
        .select(`
          *,
          clientes(nombre, email, telefono)
        `)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setFacturas(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, email")
        .order("nombre");

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
    }
  };

  const sincronizarHolded = async () => {
    setSyncing(true);
    try {
      // Sincronizar facturas locales con Holded
      const result = await holdedService.syncAllInvoices();
      
      toast({ 
        title: "Sincronización completada",
        description: `${result.success} facturas sincronizadas con Holded. ${result.errors} errores.`
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

  const crearFactura = async () => {
    try {
      // Crear factura directamente en la base de datos local
      const facturaData = {
        id: crypto.randomUUID(),
        tipo: formData.tipo,
        cliente_id: formData.cliente_id,
        total: parseFloat(formData.total),
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        fecha_vencimiento: formData.fecha_vencimiento ? new Date(formData.fecha_vencimiento).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        descripcion: formData.descripcion,
        holded_id: null
      };

      const { data, error } = await supabase
        .from('facturas')
        .insert(facturaData)
        .select(`
          *,
          clientes(nombre, email, telefono)
        `);

      if (error) throw error;

      const factura = data[0];

      // Intentar sincronizar con Holded
      try {
        const holdedId = await holdedService.syncInvoiceToHolded(factura);
        if (holdedId) {
          toast({ 
            title: "Factura creada y sincronizada",
            description: "La factura se ha creado y sincronizado con Holded correctamente"
          });
        } else {
          toast({ 
            title: "Factura creada",
            description: "La factura se ha creado localmente. La sincronización con Holded falló."
          });
        }
      } catch (syncError) {
        console.error('Error syncing with Holded:', syncError);
        toast({ 
          title: "Factura creada",
          description: "La factura se ha creado localmente. La sincronización con Holded falló."
        });
      }
      
      setShowCreateDialog(false);
      setFormData({
        tipo: 'factura',
        cliente_id: '',
        total: '',
        descripcion: '',
        fecha_vencimiento: ''
      });
      cargarFacturas();
    } catch (error: any) {
      toast({
        title: "Error al crear factura",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalPendiente = facturas.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + parseFloat(f.total.toString()), 0);
  const totalPagado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + parseFloat(f.total.toString()), 0);
  const totalFacturas = facturas.length;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Pagada</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendiente</Badge>;
      case 'vencida':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vencida</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'factura' ? (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Factura</Badge>
    ) : (
      <Badge variant="outline">Albarán</Badge>
    );
  };

  const verFactura = (factura: any) => {
    setSelectedFactura(factura);
    setShowViewDialog(true);
  };

  const editarFactura = (factura: any) => {
    setSelectedFactura(factura);
    setShowViewDialog(true);
  };

  const eliminarFactura = async (factura: any) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la factura ${factura.id}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', factura.id);

      if (error) throw error;

      toast({
        title: 'Factura eliminada',
        description: 'La factura se ha eliminado correctamente'
      });

      cargarFacturas();
    } catch (error: any) {
      toast({
        title: 'Error al eliminar factura',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-responsive font-bold text-primary-gradient flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Facturación
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de facturas, albaranes y sincronización con Holded
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Configurar Holded
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configuración de Holded</DialogTitle>
              </DialogHeader>
              <HoldedConfig />
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2" onClick={sincronizarHolded} disabled={syncing}>
            <Send className="h-4 w-4" />
            {syncing ? "Sincronizando..." : "Sincronizar Holded"}
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Factura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="factura">Factura</SelectItem>
                        <SelectItem value="albaran">Albarán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total">Total (€)</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.total}
                    onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción de la factura..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={crearFactura}>
                    Crear Factura
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
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

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
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

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalFacturas}</div>
            <p className="text-xs text-muted-foreground mt-1">En el sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Lista de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Cargando facturas...
                  </TableCell>
                </TableRow>
              ) : facturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay facturas registradas
                  </TableCell>
                </TableRow>
              ) : (
                facturas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell className="font-medium">{factura.id.slice(0, 8)}...</TableCell>
                    <TableCell>{getTipoBadge(factura.tipo)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{factura.clientes?.nombre || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{factura.clientes?.email || ""}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(factura.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      {factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES') : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{parseFloat(factura.total).toFixed(2)}€</TableCell>
                    <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => verFactura(factura)}
                          title="Ver factura"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editarFactura(factura)}
                          title="Editar factura"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => eliminarFactura(factura)}
                          title="Eliminar factura"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para ver/editar factura */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedFactura && (
            <FacturaView 
              factura={selectedFactura}
              onClose={() => setShowViewDialog(false)}
              onUpdate={() => {
                cargarFacturas();
                setShowViewDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facturacion;