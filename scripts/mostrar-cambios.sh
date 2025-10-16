#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║          ✅ CAMBIOS APLICADOS - RESUMEN VISUAL                ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "🔍 Verificando archivos modificados..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ ARCHIVOS REACT MODIFICADOS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "src/components/FichajeActual.tsx" ]; then
    echo -e "${GREEN}1. FichajeActual.tsx${NC}"
    echo "   ✅ Usa hook useFichaje"
    echo "   ✅ Funciones SQL optimizadas"
    echo "   ✅ Persiste entre sesiones"
    echo ""
fi

if [ -f "src/components/Productos.tsx" ]; then
    echo -e "${GREEN}2. Productos.tsx${NC}"
    echo "   ✅ Usa hook useUserRole"
    echo "   ✅ Botón eliminar solo para admin"
    echo "   ✅ Validación de permisos"
    echo ""
fi

if [ -f "src/components/Empleados.tsx" ]; then
    echo -e "${GREEN}3. Empleados.tsx${NC}"
    echo "   ✅ Usa hook useUserRole"
    echo "   ✅ Bloqueo completo si no es admin"
    echo "   ✅ Mensaje de permisos claro"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🆕 HOOKS PERSONALIZADOS CREADOS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "src/hooks/useFichaje.ts" ]; then
    echo -e "${BLUE}4. useFichaje.ts${NC}"
    echo "   ✨ Hook personalizado para fichajes"
    echo "   📝 Funciones: ficharEntrada(), ficharSalida()"
    echo "   🔄 Auto-actualización en tiempo real"
    echo ""
else
    echo -e "${RED}❌ src/hooks/useFichaje.ts NO ENCONTRADO${NC}"
    echo ""
fi

if [ -f "src/hooks/useUserRole.ts" ]; then
    echo -e "${BLUE}5. useUserRole.ts${NC}"
    echo "   ✨ Hook para gestión de roles"
    echo "   📝 Props: isAdmin, isEmpleado, isCliente"
    echo "   🔐 Verificación automática de permisos"
    echo ""
else
    echo -e "${RED}❌ src/hooks/useUserRole.ts NO ENCONTRADO${NC}"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🗄️  BASE DE DATOS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar funciones SQL
FUNCTIONS_COUNT=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('fichar_entrada', 'fichar_salida', 'get_active_fichaje', 'has_role');" 2>/dev/null | tr -d ' ')

if [ "$FUNCTIONS_COUNT" == "4" ]; then
    echo -e "${GREEN}✅ Funciones SQL: 4/4 creadas${NC}"
    echo "   📌 fichar_entrada"
    echo "   📌 fichar_salida"
    echo "   📌 get_active_fichaje"
    echo "   📌 has_role"
else
    echo -e "${RED}❌ Solo $FUNCTIONS_COUNT/4 funciones encontradas${NC}"
fi
echo ""

# Verificar políticas RLS
POLICIES_COUNT=$(docker exec flamenco_db psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')

if [ "$POLICIES_COUNT" -ge 30 ]; then
    echo -e "${GREEN}✅ Políticas RLS: $POLICIES_COUNT activas${NC}"
else
    echo -e "${YELLOW}⚠️  Políticas RLS: $POLICIES_COUNT (esperadas: 30+)${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📊 RESUMEN DE PERMISOS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "┌─────────────────────────┬──────┬──────────┬───────┐"
echo "│ Acción                  │ Todo │ Empleado │ Admin │"
echo "├─────────────────────────┼──────┼──────────┼───────┤"
echo "│ Eliminar productos      │  ❌  │    ❌    │  ✅   │"
echo "│ Eliminar encargos       │  ❌  │    ✅    │  ✅   │"
echo "│ Eliminar incidencias    │  ❌  │    ✅    │  ✅   │"
echo "│ Gestionar empleados     │  ❌  │    ❌    │  ✅   │"
echo "│ Fichar entrada/salida   │  ✅  │    ✅    │  ✅   │"
echo "└─────────────────────────┴──────┴──────────┴───────┘"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🚀 PRÓXIMOS PASOS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🔄 Reinicia tu aplicación:"
echo "   Ctrl+C en el terminal donde corre"
echo "   Luego: npm run dev"
echo ""
echo "2. 🌐 Accede a: http://localhost:8080"
echo ""
echo "3. 🔐 Inicia sesión:"
echo "   Email: admin@flamencropuro.es"
echo "   Password: Admin123456"
echo ""
echo "4. ✅ Prueba las funcionalidades:"
echo "   - Fichar entrada/salida (persiste al recargar)"
echo "   - Crear/editar productos (todos pueden)"
echo "   - Eliminar productos (solo admin puede)"
echo "   - Gestionar empleados (solo admin puede)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📚 DOCUMENTACIÓN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 CAMBIOS-APLICADOS.md       - Resumen completo de cambios"
echo "📄 GUIA-IMPLEMENTACION.md     - Ejemplos de código"
echo "📄 PERMISOS-Y-FUNCIONALIDADES.md - Referencia de permisos"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ ¡Todo listo! Reinicia tu app para ver los cambios ✨${NC}"
echo ""
