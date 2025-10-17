import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  User, 
  DollarSign, 
  Calendar,
  Plus,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FacturaFormProps {
  encargo?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const FacturaForm = ({ encargo, onClose, onSuccess }: FacturaFormProps) => {
  const { user, session } = useAuth();
  const [formData, setFormData] = useState({
    tipo: 'factura',
    cliente_id: encargo?.cliente_id || '',
    total: encargo?.precio_total?.toString() || encargo?.total?.toString() || '',
    descripcion: encargo ? `Factura para encargo #${encargo.id}` : '',
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

  const crearFactura = async () => {
    if (!formData.cliente_id || !formData.total) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    // Verificar autenticación
    if (!user || !session) {
      toast({
        title: 'Error de autenticación',
        description: 'Debes estar autenticado para crear facturas',
        variant: 'destructive'
      });
      return;
    }

    console.log('🔍 Usuario autenticado:', user.email);
    console.log('🔍 Sesión activa:', !!session);

    setLoading(true);
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
        holded_id: null // Se sincronizará con Holded cuando esté configurado
      };

      const { data, error } = await supabase
        .from('facturas')
        .insert(facturaData)
        .select();

      if (error) throw error;

      toast({ 
        title: 'Factura creada',
        description: 'La factura se ha creado correctamente en la base de datos local'
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error al crear factura',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          {encargo ? 'Crear Factura desde Encargo' : 'Nueva Factura'}
        </CardTitle>
        {encargo && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Encargo #{encargo.id}</Badge>
            <Badge variant="outline">{encargo.estado}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={crearFactura} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creando...' : 'Crear Factura'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacturaForm;
