-- Crear tabla de productos
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  talla TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  direccion TEXT,
  cif_nif TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de encargos
CREATE TABLE public.encargos (
  id SERIAL PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  producto_descripcion TEXT NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  fecha_pedido TIMESTAMPTZ DEFAULT now(),
  fecha_entrega TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de empleados
CREATE TABLE public.empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  rol TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de fichajes
CREATE TABLE public.fichajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID REFERENCES public.empleados(id) NOT NULL,
  fecha DATE NOT NULL,
  hora_entrada TIME NOT NULL,
  hora_salida TIME,
  horas_trabajadas DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de incidencias
CREATE TABLE public.incidencias (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  asignado_id UUID REFERENCES public.empleados(id),
  prioridad TEXT NOT NULL DEFAULT 'media',
  estado TEXT NOT NULL DEFAULT 'abierta',
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  fecha_resolucion TIMESTAMPTZ
);

-- Crear tabla de facturas
CREATE TABLE public.facturas (
  id TEXT PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id),
  tipo TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT now(),
  fecha_vencimiento TIMESTAMPTZ,
  total DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de configuración de integraciones
CREATE TABLE public.configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read/write para simplificar (en producción ajustar según roles)
CREATE POLICY "Enable all access for productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for encargos" ON public.encargos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for empleados" ON public.empleados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for fichajes" ON public.fichajes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for incidencias" ON public.incidencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for facturas" ON public.facturas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for configuracion" ON public.configuracion FOR ALL USING (true) WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encargos_updated_at BEFORE UPDATE ON public.encargos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales
INSERT INTO public.empleados (nombre, email, telefono, rol, activo) VALUES
('Laura Sánchez', 'laura@flamencropuro.es', '612345678', 'Admin', true),
('Pedro García', 'pedro@flamencropuro.es', '623456789', 'Comercial', true),
('Elena Moreno', 'elena@flamencropuro.es', '634567890', 'Empleado', true),
('Sofía Delgado', 'sofia@flamencropuro.es', '656789012', 'Comercial', true),
('Miguel Ángel Vega', 'miguel@flamencropuro.es', '667890123', 'Empleado', true);

INSERT INTO public.productos (nombre, talla, precio, stock, categoria) VALUES
('Traje Sevilla Clásico', '38', 450.00, 12, 'Trajes'),
('Mantón Bordado Oro', 'Única', 280.00, 5, 'Complementos'),
('Vestido Rocío Negro', '40', 520.00, 3, 'Trajes'),
('Bata de Cola Roja', '42', 680.00, 8, 'Trajes'),
('Conjunto Niña Lunares', '10 años', 185.00, 15, 'Infantil'),
('Zapatos Flamenco Negro', '37', 95.00, 1, 'Calzado'),
('Peineta Carey Grande', 'Única', 45.00, 22, 'Complementos'),
('Abanico Pintado Mano', 'Única', 65.00, 18, 'Complementos');
