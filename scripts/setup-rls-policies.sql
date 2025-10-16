-- =====================================================
-- CONFIGURACIÓN DE POLÍTICAS RLS
-- Flamenco Sync Studio
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE encargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA PRODUCTOS
-- =====================================================

-- Todos pueden ver productos
CREATE POLICY "Todos pueden ver productos"
ON productos FOR SELECT
TO authenticated
USING (true);

-- Todos pueden crear productos
CREATE POLICY "Todos pueden crear productos"
ON productos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos pueden actualizar productos
CREATE POLICY "Todos pueden actualizar productos"
ON productos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Solo admin puede eliminar productos
CREATE POLICY "Admin puede eliminar productos"
ON productos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS PARA ENCARGOS
-- =====================================================

-- Todos pueden ver encargos
CREATE POLICY "Todos pueden ver encargos"
ON encargos FOR SELECT
TO authenticated
USING (true);

-- Todos pueden crear encargos
CREATE POLICY "Todos pueden crear encargos"
ON encargos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos pueden actualizar encargos
CREATE POLICY "Todos pueden actualizar encargos"
ON encargos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin y empleados pueden eliminar encargos
CREATE POLICY "Admin y empleados pueden eliminar encargos"
ON encargos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'empleado')
  )
);

-- =====================================================
-- POLÍTICAS PARA INCIDENCIAS
-- =====================================================

-- Todos pueden ver incidencias
CREATE POLICY "Todos pueden ver incidencias"
ON incidencias FOR SELECT
TO authenticated
USING (true);

-- Todos pueden crear incidencias
CREATE POLICY "Todos pueden crear incidencias"
ON incidencias FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos pueden actualizar incidencias
CREATE POLICY "Todos pueden actualizar incidencias"
ON incidencias FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin y empleados pueden eliminar incidencias
CREATE POLICY "Admin y empleados pueden eliminar incidencias"
ON incidencias FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'empleado')
  )
);

-- =====================================================
-- POLÍTICAS PARA FICHAJES
-- =====================================================

-- Todos pueden ver sus propios fichajes
CREATE POLICY "Ver propios fichajes"
ON fichajes FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'empleado')
  )
);

-- Todos pueden crear sus propios fichajes
CREATE POLICY "Crear propios fichajes"
ON fichajes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Usuarios pueden actualizar sus propios fichajes, admin puede actualizar todos
CREATE POLICY "Actualizar fichajes"
ON fichajes FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Solo admin puede eliminar fichajes
CREATE POLICY "Admin puede eliminar fichajes"
ON fichajes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS PARA EMPLEADOS
-- =====================================================

-- Todos pueden ver empleados
CREATE POLICY "Todos pueden ver empleados"
ON empleados FOR SELECT
TO authenticated
USING (true);

-- Solo admin puede crear empleados
CREATE POLICY "Admin puede crear empleados"
ON empleados FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Solo admin puede actualizar empleados
CREATE POLICY "Admin puede actualizar empleados"
ON empleados FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Solo admin puede eliminar empleados
CREATE POLICY "Admin puede eliminar empleados"
ON empleados FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS PARA CLIENTES
-- =====================================================

-- Todos pueden ver clientes
CREATE POLICY "Todos pueden ver clientes"
ON clientes FOR SELECT
TO authenticated
USING (true);

-- Todos pueden crear clientes
CREATE POLICY "Todos pueden crear clientes"
ON clientes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos pueden actualizar clientes
CREATE POLICY "Todos pueden actualizar clientes"
ON clientes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin y empleados pueden eliminar clientes
CREATE POLICY "Admin y empleados pueden eliminar clientes"
ON clientes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'empleado')
  )
);

-- =====================================================
-- POLÍTICAS PARA FACTURAS
-- =====================================================

-- Todos pueden ver facturas
CREATE POLICY "Todos pueden ver facturas"
ON facturas FOR SELECT
TO authenticated
USING (true);

-- Todos pueden crear facturas
CREATE POLICY "Todos pueden crear facturas"
ON facturas FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos pueden actualizar facturas
CREATE POLICY "Todos pueden actualizar facturas"
ON facturas FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin y empleados pueden eliminar facturas
CREATE POLICY "Admin y empleados pueden eliminar facturas"
ON facturas FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'empleado')
  )
);

-- =====================================================
-- POLÍTICAS PARA CONFIGURACION
-- =====================================================

-- Todos pueden ver configuración
CREATE POLICY "Todos pueden ver configuracion"
ON configuracion FOR SELECT
TO authenticated
USING (true);

-- Solo admin puede modificar configuración
CREATE POLICY "Admin puede modificar configuracion"
ON configuracion FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- =====================================================
-- FUNCIÓN AUXILIAR PARA FICHAJES
-- =====================================================

-- Función para obtener el fichaje activo del usuario
CREATE OR REPLACE FUNCTION get_active_fichaje(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  empleado_id uuid,
  fecha date,
  hora_entrada time,
  hora_salida time,
  horas_trabajadas numeric,
  created_at timestamptz,
  user_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.*
  FROM fichajes f
  WHERE f.user_id = p_user_id
    AND f.fecha = CURRENT_DATE
    AND f.hora_salida IS NULL
  ORDER BY f.hora_entrada DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para fichar entrada
CREATE OR REPLACE FUNCTION fichar_entrada(p_empleado_id uuid DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
  v_fichaje_id uuid;
  v_empleado_id uuid;
BEGIN
  -- Si no se proporciona empleado_id, buscar por user_id
  IF p_empleado_id IS NULL THEN
    SELECT id INTO v_empleado_id
    FROM empleados
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1;
  ELSE
    v_empleado_id := p_empleado_id;
  END IF;

  -- Verificar que no haya un fichaje activo
  IF EXISTS (
    SELECT 1 FROM fichajes
    WHERE user_id = auth.uid()
      AND fecha = CURRENT_DATE
      AND hora_salida IS NULL
  ) THEN
    RAISE EXCEPTION 'Ya existe un fichaje activo para hoy';
  END IF;

  -- Crear nuevo fichaje
  INSERT INTO fichajes (
    empleado_id,
    fecha,
    hora_entrada,
    user_id
  ) VALUES (
    v_empleado_id,
    CURRENT_DATE,
    CURRENT_TIME,
    auth.uid()
  )
  RETURNING id INTO v_fichaje_id;

  RETURN v_fichaje_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para fichar salida
CREATE OR REPLACE FUNCTION fichar_salida()
RETURNS uuid AS $$
DECLARE
  v_fichaje_id uuid;
  v_hora_entrada time;
  v_horas numeric;
BEGIN
  -- Buscar fichaje activo
  SELECT id, hora_entrada INTO v_fichaje_id, v_hora_entrada
  FROM fichajes
  WHERE user_id = auth.uid()
    AND fecha = CURRENT_DATE
    AND hora_salida IS NULL
  LIMIT 1;

  IF v_fichaje_id IS NULL THEN
    RAISE EXCEPTION 'No hay fichaje activo para cerrar';
  END IF;

  -- Calcular horas trabajadas
  v_horas := EXTRACT(EPOCH FROM (CURRENT_TIME - v_hora_entrada)) / 3600;

  -- Actualizar fichaje
  UPDATE fichajes
  SET 
    hora_salida = CURRENT_TIME,
    horas_trabajadas = v_horas
  WHERE id = v_fichaje_id;

  RETURN v_fichaje_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS PARA FUNCIONES
-- =====================================================

GRANT EXECUTE ON FUNCTION get_active_fichaje(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fichar_entrada(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION fichar_salida() TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('productos', 'encargos', 'incidencias', 'fichajes', 'empleados', 'clientes', 'facturas', 'configuracion')
ORDER BY tablename, policyname;

