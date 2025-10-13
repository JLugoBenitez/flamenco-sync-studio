import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Configuracion = () => {
  const [loading, setLoading] = useState(false);
  const [wooConfig, setWooConfig] = useState({
    url: "",
    key: "",
    secret: ""
  });
  const [holdedKey, setHoldedKey] = useState("");

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    const { data } = await supabase
      .from("configuracion")
      .select("*")
      .in("clave", ["woo_url", "woo_key", "woo_secret", "holded_api_key"]);

    if (data) {
      setWooConfig({
        url: data.find(c => c.clave === "woo_url")?.valor || "",
        key: data.find(c => c.clave === "woo_key")?.valor || "",
        secret: data.find(c => c.clave === "woo_secret")?.valor || ""
      });
      setHoldedKey(data.find(c => c.clave === "holded_api_key")?.valor || "");
    }
  };

  const guardarWooCommerce = async () => {
    setLoading(true);
    try {
      const updates = [
        { clave: "woo_url", valor: wooConfig.url },
        { clave: "woo_key", valor: wooConfig.key },
        { clave: "woo_secret", valor: wooConfig.secret }
      ];

      for (const item of updates) {
        await supabase
          .from("configuracion")
          .upsert(item, { onConflict: "clave" });
      }

      toast({ title: "Configuración de WooCommerce guardada" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const guardarHolded = async () => {
    setLoading(true);
    try {
      await supabase
        .from("configuracion")
        .upsert({ clave: "holded_api_key", valor: holdedKey }, { onConflict: "clave" });

      toast({ title: "Configuración de Holded guardada" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
                    <Input
                      id="woo-url"
                      placeholder="https://tutienda.com"
                      value={wooConfig.url}
                      onChange={(e) => setWooConfig({ ...wooConfig, url: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="woo-key">Consumer Key</Label>
                    <Input
                      id="woo-key"
                      type="password"
                      placeholder="ck_..."
                      value={wooConfig.key}
                      onChange={(e) => setWooConfig({ ...wooConfig, key: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="woo-secret">Consumer Secret</Label>
                    <Input
                      id="woo-secret"
                      type="password"
                      placeholder="cs_..."
                      value={wooConfig.secret}
                      onChange={(e) => setWooConfig({ ...wooConfig, secret: e.target.value })}
                    />
                  </div>
                  <Button onClick={guardarWooCommerce} disabled={loading} className="w-fit">
                    {loading ? "Guardando..." : "Guardar WooCommerce"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Holded</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="holded-key">API Key</Label>
                    <Input
                      id="holded-key"
                      type="password"
                      placeholder="Introduce tu API Key"
                      value={holdedKey}
                      onChange={(e) => setHoldedKey(e.target.value)}
                    />
                  </div>
                  <Button onClick={guardarHolded} disabled={loading} className="w-fit">
                    {loading ? "Guardando..." : "Guardar Holded"}
                  </Button>
                </div>
              </div>
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
