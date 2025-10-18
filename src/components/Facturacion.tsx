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
  Building,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import HoldedConfig from "./HoldedConfig";
import FacturaView from "./FacturaView";
import HoldedInvoices from "./HoldedInvoices";
import holdedService from "@/services/holdedService";
import facturaSyncService from "@/services/facturaSyncService";

const Facturacion = () => {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingHolded, setSyncingHolded] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
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
    setSyncingHolded(true);
    setSyncResults(null);
    try {
      // Sincronizar facturas locales con Holded
      const result = await facturaSyncService.syncAllFacturasToHolded();
      setSyncResults(result);
      
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
      setSyncingHolded(false);
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
        const syncResult = await facturaSyncService.syncFacturaToHolded(factura.id);
        if (syncResult.success) {
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

  const cambiarEstadoFactura = async (factura: any, nuevoEstado: string) => {
    try {
      // Actualizar en base de datos local
      const { error } = await supabase
        .from('facturas')
        .update({ estado: nuevoEstado })
        .eq('id', factura.id);

      if (error) throw error;

      // Si la factura está sincronizada con Holded, actualizar también allí
      if (factura.holded_id) {
        try {
          const holdedStatus = nuevoEstado === 'pagada' ? 1 : 0;
          await holdedService.updateInvoiceStatus(factura.holded_id, holdedStatus);
          
          toast({
            title: "Estado actualizado",
            description: `La factura se ha marcado como ${nuevoEstado} y sincronizado con Holded`
          });
        } catch (holdedError) {
          console.error('Error updating Holded:', holdedError);
          toast({
            title: "Estado actualizado localmente",
            description: `La factura se ha marcado como ${nuevoEstado} localmente. Error sincronizando con Holded.`
          });
        }
      } else {
        toast({
          title: "Estado actualizado",
          description: `La factura se ha marcado como ${nuevoEstado}`
        });
      }

      cargarFacturas();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
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

          <Button variant="outline" className="gap-2" onClick={sincronizarHolded} disabled={syncingHolded}>
            <Send className="h-4 w-4" />
            {syncingHolded ? "Sincronizando..." : "Sincronizar con Holded"}
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

      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local">Facturas Locales</TabsTrigger>
          <TabsTrigger value="holded">Facturas de Holded</TabsTrigger>
        </TabsList>
        
        <TabsContent value="local">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Lista de Facturas Locales
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
                <TableHead>Sincronizado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Cargando facturas...
                  </TableCell>
                </TableRow>
              ) : facturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                    <TableCell>
                      {factura.sincronizada_holded ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sincronizado
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
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
                        <Select onValueChange={(value) => cambiarEstadoFactura(factura, value)}>
                          <SelectTrigger className="w-8 h-8 p-0 border-0 bg-transparent hover:bg-gray-100">
                            <ArrowUpDown className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="enviada">Enviada</SelectItem>
                            <SelectItem value="pagada">Pagada</SelectItem>
                            <SelectItem value="vencida">Vencida</SelectItem>
                          </SelectContent>
                        </Select>
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

          {/* Resultados de sincronización */}
          {syncResults && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Resultados de Sincronización con Holded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{syncResults.success}</div>
                    <div className="text-sm text-muted-foreground">Exitosas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{syncResults.errors}</div>
                    <div className="text-sm text-muted-foreground">Errores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{syncResults.success + syncResults.errors}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
                
                {syncResults.details.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Detalles:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {syncResults.details.map((detail: any, index: number) => (
                        <div key={index} className={`p-2 rounded text-sm ${
                          detail.type === 'success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {detail.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="holded">
          <HoldedInvoices />
        </TabsContent>
      </Tabs>

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