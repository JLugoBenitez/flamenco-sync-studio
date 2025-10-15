import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const EncargosForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    producto_descripcion: "",
    precio_total: "",
    estado: "pendiente",
    fecha_entrega: "",
    notas: ""
  });

  useEffect(() => {
    if (open) cargarClientes();
  }, [open]);

  const cargarClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").order("nombre");
    if (data) setClientes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("encargos").insert({
        cliente_id: formData.cliente_id || null,
        producto_descripcion: formData.producto_descripcion,
        precio_total: parseFloat(formData.precio_total),
        estado: formData.estado,
        fecha_entrega: formData.fecha_entrega ? new Date(formData.fecha_entrega).toISOString() : null,
        notas: formData.notas || null
      });

      if (error) throw error;

      toast({ title: "Encargo creado correctamente" });
      setOpen(false);
      setFormData({ cliente_id: "", producto_descripcion: "", precio_total: "", estado: "pendiente", fecha_entrega: "", notas: "" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Encargo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Encargo</DialogTitle>
          <DialogDescription className="sr-only">Rellena los datos del encargo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
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
            <div className="space-y-2">
              <Label htmlFor="precio">Precio Total (€) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio_total}
                onChange={(e) => setFormData({ ...formData, precio_total: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_produccion">En Producción</SelectItem>
                  <SelectItem value="listo">Listo para Entrega</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
              <Input
                id="fecha_entrega"
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="producto">Descripción del Producto *</Label>
            <Textarea
              id="producto"
              value={formData.producto_descripcion}
              onChange={(e) => setFormData({ ...formData, producto_descripcion: e.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Encargo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
