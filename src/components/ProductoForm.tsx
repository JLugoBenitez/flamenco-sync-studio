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

interface ProductoFormProps {
  onSuccess: () => void;
  producto?: any;
  trigger?: React.ReactNode;
}

export const ProductoForm = ({ onSuccess, producto, trigger }: ProductoFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || "",
    talla: producto?.talla || "",
    precio: producto?.precio?.toString() || "",
    stock: producto?.stock?.toString() || "",
    categoria: producto?.categoria || "",
    descripcion: producto?.descripcion || "",
    imagen_url: producto?.imagen_url || "",
    woo_product_id: producto?.woo_product_id || null
  });

  // Actualizar formulario cuando cambia el producto
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        talla: producto.talla || "",
        precio: producto.precio?.toString() || "",
        stock: producto.stock?.toString() || "",
        categoria: producto.categoria || "",
        descripcion: producto.descripcion || "",
        imagen_url: producto.imagen_url || "",
        woo_product_id: producto.woo_product_id || null
      });
    }
  }, [producto]);

  const syncToWooCommerce = async (productoData: any) => {
    try {
      const { data: config } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', ['woo_url', 'woo_key', 'woo_secret']);

      if (!config || config.length < 3) return;

      const wooUrl = config.find((c: any) => c.clave === 'woo_url')?.valor;
      const wooKey = config.find((c: any) => c.clave === 'woo_key')?.valor;
      const wooSecret = config.find((c: any) => c.clave === 'woo_secret')?.valor;

      if (!wooUrl || !wooKey || !wooSecret) return;

      const auth = btoa(`${wooKey}:${wooSecret}`);
      const wooPayload = {
        name: productoData.nombre,
        regular_price: productoData.precio.toString(),
        stock_quantity: productoData.stock,
        description: productoData.descripcion || '',
        manage_stock: true,
        stock_status: productoData.stock > 0 ? 'instock' : 'outofstock',
        categories: [
          {
            name: productoData.categoria || 'General'
          }
        ]
      };

      if (productoData.woo_product_id) {
        // Actualizar producto existente
        const response = await fetch(`${wooUrl}/wp-json/wc/v3/products/${productoData.woo_product_id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wooPayload)
        });

        if (response.ok) {
          console.log(`✓ Producto actualizado en WooCommerce: ${productoData.nombre}`);
        }
      } else {
        // Crear nuevo producto
        const response = await fetch(`${wooUrl}/wp-json/wc/v3/products`, {
          method: 'POST',
          headers: { 
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wooPayload)
        });

        if (response.ok) {
          const wooProduct = await response.json();
          // Actualizar woo_product_id en la base de datos local
          await supabase
            .from('productos')
            .update({ woo_product_id: String(wooProduct.id) })
            .eq('id', productoData.id);
          
          console.log(`✓ Producto creado en WooCommerce: ${productoData.nombre} (ID: ${wooProduct.id})`);
        }
      }
    } catch (error) {
      console.error('Error sincronizando con WooCommerce:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        talla: formData.talla,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        imagen_url: formData.imagen_url || null
      };

      let result;
      if (producto?.id) {
        // Actualizar producto existente
        const { data, error } = await supabase
          .from("productos")
          .update(payload)
          .eq('id', producto.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        toast({ title: "Producto actualizado correctamente" });
      } else {
        // Crear nuevo producto
        const { data, error } = await supabase
          .from("productos")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast({ title: "Producto creado correctamente" });
      }

      // Sincronizar con WooCommerce en segundo plano
      if (result) {
        if (formData.woo_product_id) {
          // Actualizar producto existente en WooCommerce
          syncToWooCommerce({ ...result, woo_product_id: formData.woo_product_id });
        } else {
          // Crear nuevo producto en WooCommerce (tanto para nuevos como para actualizaciones sin woo_product_id)
          syncToWooCommerce(result);
        }
      }

      setOpen(false);
      setFormData({ nombre: "", talla: "", precio: "", stock: "", categoria: "", descripcion: "", imagen_url: "", woo_product_id: null });
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
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto?.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
          <DialogDescription className="sr-only">Rellena los datos del producto</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="talla">Talla</Label>
              <Input
                id="talla"
                value={formData.talla}
                onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (€) *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trajes">Trajes</SelectItem>
                  <SelectItem value="Complementos">Complementos</SelectItem>
                  <SelectItem value="Calzado">Calzado</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : (producto?.id ? "Actualizar Producto" : "Guardar Producto")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
