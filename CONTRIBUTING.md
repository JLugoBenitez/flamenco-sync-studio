# 🤝 Guía de Contribución - Flamenco Sync Studio

¡Gracias por tu interés en contribuir a Flamenco Sync Studio! 🎉

## 📋 Índice
- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)
- [Pull Requests](#pull-requests)

## 📜 Código de Conducta

Este proyecto sigue un código de conducta que esperamos que todos los contribuidores sigan:

- **Respeto**: Trata a todos con respeto y cortesía
- **Inclusión**: Bienvenimos contribuidores de todos los orígenes
- **Colaboración**: Trabajamos juntos para mejorar el proyecto
- **Constructividad**: Las críticas deben ser constructivas y útiles

## 🚀 Cómo Contribuir

### 1. Fork del Repositorio
```bash
# Fork el repositorio en GitHub
# Luego clona tu fork localmente
git clone https://github.com/tu-usuario/flamenco-sync-studio.git
cd flamenco-sync-studio
```

### 2. Configurar Remote
```bash
# Añadir el repositorio original como upstream
git remote add upstream https://github.com/original/flamenco-sync-studio.git

# Verificar configuración
git remote -v
```

### 3. Crear Rama de Feature
```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nombre-de-tu-feature

# O para bugfix
git checkout -b fix/descripcion-del-bug
```

## ⚙️ Configuración del Entorno

### Requisitos
- Node.js 18+ (recomendado 20+)
- Docker y Docker Compose
- Git

### Instalación
```bash
# Instalar dependencias
npm install

# Instalar dependencias del Edge Function
cd edge-local
npm install
cd ..

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Iniciar servicios
./start-app.sh
```

### Verificar Instalación
```bash
# Ejecutar tests (si existen)
npm test

# Verificar linting
npm run lint

# Verificar build
npm run build
```

## 🔄 Proceso de Desarrollo

### 1. Sincronizar con Upstream
```bash
# Antes de empezar, sincronizar con upstream
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Desarrollo
```bash
# Crear rama para tu feature
git checkout -b feature/mi-nueva-feature

# Hacer cambios
# ... tu código ...

# Commit con mensaje descriptivo
git add .
git commit -m "feat: añadir nueva funcionalidad de X"
```

### 3. Testing
```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Verificar que la app funciona
./start-app.sh
# Probar en http://localhost:8080
```

### 4. Push y Pull Request
```bash
# Push a tu fork
git push origin feature/mi-nueva-feature

# Crear Pull Request en GitHub
```

## 📝 Estándares de Código

### Convenciones de Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción

[body opcional]

[footer opcional]
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionalidad)
- `refactor`: Refactoring de código
- `test`: Añadir o modificar tests
- `chore`: Cambios en build, dependencias, etc.

**Ejemplos:**
```bash
git commit -m "feat(fichaje): añadir validación de horarios"
git commit -m "fix(api): corregir error 404 en endpoint de facturas"
git commit -m "docs(readme): actualizar instrucciones de instalación"
```

### Estilo de Código

#### TypeScript/React
```typescript
// Usar interfaces para tipos
interface Empleado {
  id: string;
  nombre: string;
  email: string;
}

// Usar const assertions cuando sea apropiado
const ESTADOS_FICHAJE = ['entrada', 'salida'] as const;

// Preferir arrow functions para componentes
const EmpleadoCard: React.FC<{ empleado: Empleado }> = ({ empleado }) => {
  return (
    <div className="p-4 border rounded">
      <h3>{empleado.nombre}</h3>
      <p>{empleado.email}</p>
    </div>
  );
};
```

#### Naming Conventions
- **Variables**: `camelCase` (`nombreEmpleado`)
- **Funciones**: `camelCase` (`obtenerFichajes`)
- **Componentes**: `PascalCase` (`EmpleadoCard`)
- **Constantes**: `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- **Archivos**: `kebab-case` (`empleado-form.tsx`)

### Estructura de Archivos
```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizables
│   └── ...
├── hooks/              # Custom hooks
├── services/           # Servicios y APIs
├── contexts/           # React contexts
├── lib/                # Utilidades
└── types/              # Definiciones de tipos
```

## 🐛 Reportar Bugs

### Antes de Reportar
1. Verifica que no sea un problema conocido
2. Actualiza a la última versión
3. Revisa la documentación

### Información Requerida
```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento Esperado**
Lo que debería pasar.

**Comportamiento Actual**
Lo que está pasando.

**Screenshots**
Si aplica, añadir capturas de pantalla.

**Información del Sistema**
- OS: [e.g. Ubuntu 22.04]
- Node.js: [e.g. 20.10.0]
- Docker: [e.g. 24.0.0]

**Logs**
```
Pegar logs relevantes aquí
```
```

## 💡 Solicitar Features

### Antes de Solicitar
1. Verifica que no esté ya implementado
2. Revisa issues existentes
3. Considera si es realmente necesario

### Template de Feature Request
```markdown
**¿Tu feature request está relacionada con un problema?**
Descripción clara del problema.

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas que has considerado**
Otras soluciones que has pensado.

**Contexto adicional**
Cualquier otro contexto sobre la feature request.
```

## 🔀 Pull Requests

### Antes de Crear PR
- [ ] Código sigue los estándares del proyecto
- [ ] Tests pasan (si existen)
- [ ] Linting pasa
- [ ] Documentación actualizada
- [ ] Commits siguen convenciones
- [ ] Branch actualizada con main

### Template de PR
```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Mi código sigue las guías de estilo
- [ ] He hecho self-review
- [ ] He comentado código complejo
- [ ] He actualizado documentación
- [ ] Mis cambios no generan warnings
- [ ] He añadido tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan localmente

## Screenshots (si aplica)
Añadir capturas de pantalla.

## Información Adicional
Cualquier información adicional relevante.
```

### Proceso de Review
1. **Automático**: CI/CD checks
2. **Manual**: Review de código por maintainers
3. **Testing**: Verificación de funcionalidad
4. **Merge**: Una vez aprobado

## 🏷️ Etiquetas de Issues

- `bug`: Algo no funciona
- `enhancement`: Nueva feature o mejora
- `documentation`: Mejoras en documentación
- `good first issue`: Bueno para nuevos contribuidores
- `help wanted`: Necesita ayuda extra
- `question`: Pregunta o discusión
- `wontfix`: No se va a arreglar

## 📚 Recursos Adicionales

- [Documentación de React](https://reactjs.org/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## 🆘 Obtener Ayuda

- **Discussions**: Usa GitHub Discussions para preguntas
- **Issues**: Para bugs y feature requests
- **Email**: [tu-email@ejemplo.com]

## 🙏 Reconocimientos

¡Gracias a todos los contribuidores que hacen posible este proyecto!

---

**¡Gracias por contribuir a Flamenco Sync Studio! 🎭✨**
