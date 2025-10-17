import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  User, 
  DollarSign, 
  Calendar,
  Save,
  X,
  Download,
  Building,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import holdedService from '@/services/holdedService';

interface FacturaViewProps {
  factura: any;
  onClose: () => void;
  onUpdate: () => void;
}

const FacturaView = ({ factura, onClose, onUpdate }: FacturaViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    tipo: factura.tipo,
    cliente_id: factura.cliente_id || '',
    total: factura.total?.toString() || '',
    descripcion: factura.descripcion || '',
    fecha_vencimiento: factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toISOString().split('T')[0] : '',
    estado: factura.estado
  });
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre, email')
        .order('nombre');

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
    }
  };

  const actualizarFactura = async () => {
    if (!formData.cliente_id || !formData.total) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const facturaData = {
        tipo: formData.tipo,
        cliente_id: formData.cliente_id,
        total: parseFloat(formData.total),
        estado: formData.estado,
        fecha_vencimiento: formData.fecha_vencimiento ? new Date(formData.fecha_vencimiento).toISOString() : null,
        descripcion: formData.descripcion
      };

      const { error } = await supabase
        .from('facturas')
        .update(facturaData)
        .eq('id', factura.id);

      if (error) throw error;

      toast({ 
        title: 'Factura actualizada',
        description: 'La factura se ha actualizado correctamente'
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar factura',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async () => {
    try {
      // Generar PDF usando jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      // Título
      doc.setFontSize(20);
      doc.text('FACTURA', 20, 30);
      
      // Información de la empresa
      doc.setFontSize(12);
      doc.text('Flamenco Sync Studio', 20, 50);
      doc.text('C/ Flamenco, 123', 20, 60);
      doc.text('41001 Sevilla, España', 20, 70);
      doc.text('CIF: 12345678A', 20, 80);
      
      // Información de la factura
      doc.text(`Número: ${factura.id}`, 120, 50);
      doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}`, 120, 60);
      doc.text(`Tipo: ${factura.tipo.toUpperCase()}`, 120, 70);
      doc.text(`Estado: ${factura.estado.toUpperCase()}`, 120, 80);
      
      // Información del cliente
      if (factura.clientes) {
        doc.text('Cliente:', 20, 100);
        doc.text(factura.clientes.nombre, 20, 110);
        if (factura.clientes.email) {
          doc.text(factura.clientes.email, 20, 120);
        }
        if (factura.clientes.telefono) {
          doc.text(factura.clientes.telefono, 20, 130);
        }
      }
      
      // Descripción
      if (factura.descripcion) {
        doc.text('Descripción:', 20, 150);
        const splitDesc = doc.splitTextToSize(factura.descripcion, 170);
        doc.text(splitDesc, 20, 160);
      }
      
      // Total
      doc.setFontSize(16);
      doc.text(`TOTAL: ${parseFloat(factura.total).toFixed(2)}€`, 20, 200);
      
      // Fecha de vencimiento
      if (factura.fecha_vencimiento) {
        doc.setFontSize(12);
        doc.text(`Vencimiento: ${new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES')}`, 20, 220);
      }
      
      // Guardar PDF
      doc.save(`factura-${factura.id}.pdf`);
      
      toast({
        title: 'PDF generado',
        description: 'La factura se ha descargado correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error al generar PDF',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

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

  const sincronizarConHolded = async () => {
    try {
      const holdedId = await holdedService.syncInvoiceToHolded(factura);
      if (holdedId) {
        toast({
          title: 'Sincronización exitosa',
          description: 'La factura se ha sincronizado con Holded correctamente'
        });
        onUpdate();
      } else {
        toast({
          title: 'Error de sincronización',
          description: 'No se pudo sincronizar la factura con Holded',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error de sincronización',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            {isEditing ? 'Editar Factura' : 'Ver Factura'}
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={descargarPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                {!factura.holded_id && (
                  <Button variant="outline" size="sm" onClick={sincronizarConHolded}>
                    <Building className="h-4 w-4 mr-2" />
                    Sincronizar Holded
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTipoBadge(factura.tipo)}
          {getEstadoBadge(factura.estado)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Documento</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factura">Factura</SelectItem>
                    <SelectItem value="albaran">Albarán</SelectItem>
                    <SelectItem value="presupuesto">Presupuesto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagada">Pagada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select 
                value={formData.cliente_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{cliente.nombre}</div>
                          <div className="text-sm text-muted-foreground">{cliente.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total (€) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.total}
                  onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del documento..."
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={actualizarFactura} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Información de la Factura</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">ID:</span>
                      <span className="text-sm font-mono">{factura.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fecha:</span>
                      <span className="text-sm">{new Date(factura.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vencimiento:</span>
                      <span className="text-sm">
                        {factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES') : 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="text-sm font-semibold">{parseFloat(factura.total).toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <div className="mt-2 space-y-2">
                    {factura.clientes ? (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{factura.clientes.nombre}</span>
                        </div>
                        {factura.clientes.email && (
                          <div className="text-sm text-muted-foreground">{factura.clientes.email}</div>
                        )}
                        {factura.clientes.telefono && (
                          <div className="text-sm text-muted-foreground">{factura.clientes.telefono}</div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">Cliente no especificado</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {factura.descripcion && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">{factura.descripcion}</p>
                </div>
              </div>
            )}

            {factura.holded_id && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Sincronización con Holded</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Sincronizada con Holded</span>
                  <span className="text-xs text-muted-foreground">(ID: {factura.holded_id})</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacturaView;
