import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";

const Productos = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const productos = [
    { id: 1, nombre: "Traje Sevilla Clásico", talla: "38", precio: 450, stock: 12, categoria: "Trajes", estado: "disponible" },
    { id: 2, nombre: "Mantón Bordado Oro", talla: "Única", precio: 280, stock: 5, categoria: "Complementos", estado: "disponible" },
    { id: 3, nombre: "Vestido Rocío Negro", talla: "40", precio: 520, stock: 3, categoria: "Trajes", estado: "bajo" },
    { id: 4, nombre: "Bata de Cola Roja", talla: "42", precio: 680, stock: 8, categoria: "Trajes", estado: "disponible" },
    { id: 5, nombre: "Conjunto Niña Lunares", talla: "10 años", precio: 185, stock: 15, categoria: "Infantil", estado: "disponible" },
    { id: 6, nombre: "Zapatos Flamenco Negro", talla: "37", precio: 95, stock: 1, categoria: "Calzado", estado: "critico" },
    { id: 7, nombre: "Peineta Carey Grande", talla: "Única", precio: 45, stock: 22, categoria: "Complementos", estado: "disponible" },
    { id: 8, nombre: "Abanico Pintado Mano", talla: "Única", precio: 65, stock: 18, categoria: "Complementos", estado: "disponible" }
  ];

  const getStockBadge = (estado: string) => {
    switch (estado) {
      case "critico":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Crítico</Badge>;
      case "bajo":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Bajo</Badge>;
      default:
        return <Badge variant="outline" className="text-green-600 border-green-600">Disponible</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Productos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de inventario y stock
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{producto.talla}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell className="text-right">{producto.precio}€</TableCell>
                  <TableCell className="text-center">{producto.stock}</TableCell>
                  <TableCell className="text-center">{getStockBadge(producto.estado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Productos;
