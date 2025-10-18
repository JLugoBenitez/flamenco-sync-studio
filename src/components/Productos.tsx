import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, AlertTriangle, Package, TrendingUp, DollarSign, Plus } from "lucide-react";
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
          <h1 className="text-3xl md:text-4xl font-bold text-primary-gradient">
            Productos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de inventario y stock
          </p>
        </div>
        {isAdmin && <ProductoForm onSuccess={cargarProductos} />}
      </div>

      {isAdmin && <WooCommerceSync onSyncComplete={cargarProductos} />}

      {/* Estadísticas de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-primary">{productos.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Productos</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-emerald-500">{productos.filter(p => p.stock > 3).length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">En Stock</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-amber-500">{productos.filter(p => p.stock <= 3 && p.stock > 0).length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Bajo Stock</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-highlight">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-red-500">{productos.filter(p => p.stock === 0).length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Sin Stock</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-highlight">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lista de Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Talla</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="font-semibold text-right">Precio</TableHead>
                  <TableHead className="font-semibold text-center">Stock</TableHead>
                  <TableHead className="font-semibold text-center">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Cargando productos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : productosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron productos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  productosFiltrados.map((producto) => (
                    <TableRow key={producto.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold">{producto.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{producto.talla}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{producto.categoria}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{producto.precio}€</TableCell>
                      <TableCell className="text-center font-semibold">{producto.stock}</TableCell>
                      <TableCell className="text-center">{getStockBadge(producto.stock)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <ProductoForm 
                            producto={producto}
                            onSuccess={cargarProductos}
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
                              onClick={() => eliminarProducto(producto.id)}
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
    </div>
  );
};

export default Productos;
