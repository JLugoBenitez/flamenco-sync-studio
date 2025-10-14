-- PARTE 1: SISTEMA DE ROLES Y AUTENTICACIÓN
-- Crear enum para roles de la aplicación
CREATE TYPE public.app_role AS ENUM ('admin', 'empleado', 'cliente');

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles (SECURITY DEFINER para evitar recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear perfil
  INSERT INTO public.profiles (id, user_id, nombre, email)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email
  );
  
  -- Asignar rol por defecto (empleado)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'empleado');
  
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PARTE 2: LIMPIAR TODOS LOS DATOS DE PRUEBA
TRUNCATE TABLE public.productos CASCADE;
TRUNCATE TABLE public.encargos CASCADE;
TRUNCATE TABLE public.fichajes CASCADE;
TRUNCATE TABLE public.incidencias CASCADE;
TRUNCATE TABLE public.facturas CASCADE;
TRUNCATE TABLE public.clientes CASCADE;
TRUNCATE TABLE public.empleados CASCADE;

-- Mantener solo configuraciones esenciales (limpiar API keys)
DELETE FROM public.configuracion;

-- PARTE 3: ACTUALIZAR POLÍTICAS RLS - PRODUCTOS
DROP POLICY IF EXISTS "Enable all access for productos" ON public.productos;

CREATE POLICY "Empleados y admins pueden ver productos"
  ON public.productos FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Solo admins pueden insertar productos"
  ON public.productos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Solo admins pueden actualizar productos"
  ON public.productos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Solo admins pueden eliminar productos"
  ON public.productos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 4: ACTUALIZAR POLÍTICAS RLS - CLIENTES
DROP POLICY IF EXISTS "Enable all access for clientes" ON public.clientes;

CREATE POLICY "Empleados y admins pueden ver clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden insertar clientes"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden actualizar clientes"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Solo admins pueden eliminar clientes"
  ON public.clientes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 5: ACTUALIZAR POLÍTICAS RLS - ENCARGOS
DROP POLICY IF EXISTS "Enable all access for encargos" ON public.encargos;

CREATE POLICY "Empleados y admins pueden ver encargos"
  ON public.encargos FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden crear encargos"
  ON public.encargos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden actualizar encargos"
  ON public.encargos FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Solo admins pueden eliminar encargos"
  ON public.encargos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 6: ACTUALIZAR POLÍTICAS RLS - EMPLEADOS
DROP POLICY IF EXISTS "Enable all access for empleados" ON public.empleados;

CREATE POLICY "Solo admins pueden gestionar empleados"
  ON public.empleados FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PARTE 7: ACTUALIZAR POLÍTICAS RLS - FICHAJES
DROP POLICY IF EXISTS "Enable all access for fichajes" ON public.fichajes;

-- Añadir columna user_id a fichajes para enlazar con auth
ALTER TABLE public.fichajes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Usuarios pueden ver sus propios fichajes"
  ON public.fichajes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Usuarios pueden crear sus propios fichajes"
  ON public.fichajes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios fichajes"
  ON public.fichajes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Solo admins pueden eliminar fichajes"
  ON public.fichajes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 8: ACTUALIZAR POLÍTICAS RLS - INCIDENCIAS
DROP POLICY IF EXISTS "Enable all access for incidencias" ON public.incidencias;

-- Añadir columna creado_por para enlazar con usuarios
ALTER TABLE public.incidencias ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES auth.users(id);

CREATE POLICY "Empleados y admins pueden ver incidencias"
  ON public.incidencias FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden crear incidencias"
  ON public.incidencias FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden actualizar incidencias"
  ON public.incidencias FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Solo admins pueden eliminar incidencias"
  ON public.incidencias FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 9: ACTUALIZAR POLÍTICAS RLS - FACTURAS
DROP POLICY IF EXISTS "Enable all access for facturas" ON public.facturas;

CREATE POLICY "Empleados y admins pueden ver facturas"
  ON public.facturas FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden crear facturas"
  ON public.facturas FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Empleados y admins pueden actualizar facturas"
  ON public.facturas FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'empleado')
  );

CREATE POLICY "Solo admins pueden eliminar facturas"
  ON public.facturas FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 10: ACTUALIZAR POLÍTICAS RLS - CONFIGURACION (PRIVADA)
DROP POLICY IF EXISTS "Enable all access for configuracion" ON public.configuracion;

CREATE POLICY "Solo admins pueden gestionar configuración"
  ON public.configuracion FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PARTE 11: POLÍTICAS RLS PARA PROFILES
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PARTE 12: POLÍTICAS RLS PARA USER_ROLES
CREATE POLICY "Usuarios pueden ver sus propios roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Solo admins pueden gestionar roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at en profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();