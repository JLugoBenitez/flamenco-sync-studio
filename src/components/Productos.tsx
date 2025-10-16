import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProductoForm } from "./ProductoForm";
import { WooCommerceSync } from "./WooCommerceSync";
import { useUserRole } from "@/hooks/useUserRole";

const Productos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUserRole();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProductos(data || []);
    }
    setLoading(false);
  };

  const eliminarProducto = async (id: string) => {
    if (!isAdmin) {
      toast({ 
        title: "Permiso denegado", 
        description: "Solo los administradores pueden eliminar productos",
        variant: "destructive" 
      });
      return;
    }

    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    // Obtener el producto antes de eliminarlo para saber si tiene woo_product_id
    const { data: producto } = await supabase
      .from("productos")
      .select("woo_product_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Intentar eliminar también de WooCommerce si tiene woo_product_id
      if (producto?.woo_product_id) {
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
              await fetch(`${wooUrl}/wp-json/wc/v3/products/${producto.woo_product_id}?force=true`, {
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

      toast({ title: "Producto eliminado" });
      cargarProductos();
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Sin Stock</Badge>;
    if (stock <= 3) return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Bajo</Badge>;
    return <Badge variant="outline" className="text-green-600 border-green-600">Disponible</Badge>;
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Productos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de inventario y stock
          </p>
        </div>
        {isAdmin && <ProductoForm onSuccess={cargarProductos} />}
      </div>

      {isAdmin && <WooCommerceSync />}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden sm:table-cell">Talla</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell className="hidden sm:table-cell">{producto.talla}</TableCell>
                    <TableCell className="hidden md:table-cell">{producto.categoria}</TableCell>
                    <TableCell className="text-right">{producto.precio}€</TableCell>
                    <TableCell className="text-center">{producto.stock}</TableCell>
                    <TableCell className="text-center">{getStockBadge(producto.stock)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ProductoForm 
                          producto={producto}
                          onSuccess={cargarProductos}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => eliminarProducto(producto.id)}
                            className="text-destructive hover:text-destructive"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Productos;
