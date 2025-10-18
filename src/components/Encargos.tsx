import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ShoppingCart, Clock, CheckCircle, AlertCircle, TrendingUp, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EncargosForm } from "./EncargosForm";
import { WooCommerceOrderSync } from "./WooCommerceOrderSync";
import { useUserRole } from "@/hooks/useUserRole";
import FacturaForm from "./FacturaForm";

const Encargos = () => {
  const [encargos, setEncargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFacturaForm, setShowFacturaForm] = useState(false);
  const [selectedEncargo, setSelectedEncargo] = useState<any>(null);
  const { isAdmin } = useUserRole();

  useEffect(() => {
    cargarEncargos();
  }, []);

  const cargarEncargos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("encargos")
      .select(`
        *,
        clientes(nombre)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEncargos(data || []);
    }
    setLoading(false);
  };

  const crearFacturaDesdeEncargo = (encargo: any) => {
    setSelectedEncargo(encargo);
    setShowFacturaForm(true);
  };

  const eliminarEncargo = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este encargo?")) return;

    // Obtener el encargo antes de eliminarlo
    const { data: encargo } = await supabase
      .from("encargos")
      .select("woo_order_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("encargos").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Intentar eliminar también de WooCommerce si tiene woo_order_id
      if (encargo?.woo_order_id) {
        try {
          const { data: config } = await supabase
            .from('configuracion')
            .select('clave, valor')
            .in('clave', ['woo_url', 'woo_key', 'woo_secret']);

          if (config && config.length === 3) {
            const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
            const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
            const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;

            if (wooUrl && wooKey && wooSecret) {
              const auth = btoa(`${wooKey}:${wooSecret}`);
              await fetch(`${wooUrl}/wp-json/wc/v3/orders/${encargo.woo_order_id}?force=true`, {
                method: 'DELETE',
                headers: { 
                  'Authorization': `Basic ${auth}`,
                  'Content-Type': 'application/json'
                }
              });
            }
          }
        } catch (e) {
          console.error('Error eliminando de WooCommerce:', e);
        }
      }

      toast({ title: "Encargo eliminado" });
      cargarEncargos();
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "listo":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Listo para Entrega</Badge>;
      case "en_produccion":
      case "en_proceso":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">En Proceso</Badge>;
      case "pendiente":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">Pendiente</Badge>;
      case "entregado":
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white border-0">Entregado</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "listo":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "en_produccion":
      case "en_proceso":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pendiente":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "entregado":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case "cancelado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-gradient">
            Encargos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de pedidos personalizados
          </p>
        </div>
        <EncargosForm onSuccess={cargarEncargos} />
      </div>

      {isAdmin && <WooCommerceOrderSync onSyncComplete={cargarEncargos} />}

      {/* Estadísticas de Encargos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-amber-500">{encargos.filter(e => e.estado === 'pendiente').length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Pendientes</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-blue-500">{encargos.filter(e => e.estado === 'en_produccion').length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">En Producción</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-emerald-500">{encargos.filter(e => e.estado === 'listo').length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Listos</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-primary">{encargos.reduce((sum, e) => sum + (e.total || 0), 0).toFixed(0)}€</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Activos</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-highlight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Lista de Encargos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Nº Encargo</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Fecha Pedido</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Fecha Entrega</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Cargando encargos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : encargos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay encargos registrados</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  encargos.map((encargo) => (
                    <TableRow key={encargo.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold">#{encargo.id}</span>
                          {getEstadoIcon(encargo.estado)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{encargo.clientes?.nombre || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={encargo.producto_descripcion}>
                        {encargo.producto_descripcion}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(encargo.fecha_pedido).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {encargo.fecha_entrega ? new Date(encargo.fecha_entrega).toLocaleDateString('es-ES') : 'Sin fecha'}
                      </TableCell>
                      <TableCell>{getEstadoBadge(encargo.estado)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{parseFloat(encargo.precio_total).toFixed(2)}€</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-green-500 hover:text-white transition-colors"
                            onClick={() => crearFacturaDesdeEncargo(encargo)}
                            title="Crear factura"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <EncargosForm 
                            encargo={encargo}
                            onSuccess={cargarEncargos}
                            trigger={
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-primary hover:text-white transition-colors">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-red-500 hover:text-white transition-colors"
                              onClick={() => eliminarEncargo(encargo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de creación de factura */}
      {showFacturaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <FacturaForm
              encargo={selectedEncargo}
              onClose={() => {
                setShowFacturaForm(false);
                setSelectedEncargo(null);
              }}
              onSuccess={() => {
                cargarEncargos();
                setShowFacturaForm(false);
                setSelectedEncargo(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Encargos;
