import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Link as LinkIcon, Mail, Bell } from "lucide-react";

const Configuracion = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-2">
          Ajustes generales del sistema
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Integraciones Externas
            </CardTitle>
            <CardDescription>
              Conecta con WooCommerce y Holded para sincronización automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">WooCommerce</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="woo-url">URL de la Tienda</Label>
                    <Input id="woo-url" placeholder="https://tutienda.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="woo-key">Consumer Key</Label>
                    <Input id="woo-key" type="password" placeholder="ck_..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="woo-secret">Consumer Secret</Label>
                    <Input id="woo-secret" type="password" placeholder="cs_..." />
                  </div>
                  <Button className="w-fit">Conectar WooCommerce</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Holded</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="holded-key">API Key</Label>
                    <Input id="holded-key" type="password" placeholder="Introduce tu API Key" />
                  </div>
                  <Button className="w-fit">Conectar Holded</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-secondary" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo quieres recibir las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas importantes por correo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas de encargos y ventas por WhatsApp
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Stock Bajo</Label>
                <p className="text-sm text-muted-foreground">
                  Notificación cuando el stock sea crítico
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-accent" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Ajustes del negocio y facturación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="empresa">Nombre de la Empresa</Label>
              <Input id="empresa" defaultValue="FlamencoPuro S.L." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cif">CIF/NIF</Label>
              <Input id="cif" defaultValue="B12345678" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" defaultValue="Calle Sierpes, 42, Sevilla" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" defaultValue="+34 954 123 456" />
            </div>
            <Button className="w-fit mt-4">Guardar Cambios</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracion;
