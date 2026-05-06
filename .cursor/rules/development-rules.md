# Reglas de Desarrollo - Folysoft Frontend

Este documento establece las reglas obligatorias para evitar errores de compilación y mantener la consistencia del código.

## Checklist Antes de Hacer Cambios

Antes de modificar cualquier componente o archivo, verifica:

- [ ] Todos los imports están correctos y los componentes/estilos existen
- [ ] Los exports coinciden con los imports
- [ ] Los tipos TypeScript están correctamente definidos
- [ ] Los styled components están exportados desde el archivo correcto
- [ ] No hay referencias a componentes/estilos eliminados
- [ ] Los colores y estilos usan el tema MUI (`theme.palette`, `theme.palette.app` desde `@/styles/theme`)

---

## Reglas de Styled Components

### 1. Ubicación de Estilos

**OBLIGATORIO**: Los styled components de cada página deben estar en un archivo separado:

```
/pages/catalogos/
  ├── departamentos.tsx
  └── departamentos.styledComponents.ts   CORRECTO

/pages/catalogos/
  ├── departamentos.tsx
  └── catalogos.styledComponents.ts   CORRECTO (si se comparten entre páginas)
```

** INCORRECTO**: Estilos inline en el mismo archivo del componente.

### 2. Exportación de Styled Components

**OBLIGATORIO**: Todos los styled components deben ser exportados:

```typescript
//  CORRECTO
export const HeaderContainer = styled(Box)({...});
export const SearchInput = styled(TextField)({...});

//  INCORRECTO
const HeaderContainer = styled(Box)({...}); // Sin export
```

### 3. Imports de Styled Components

**OBLIGATORIO**: Importar desde el archivo correcto:

```typescript
//  CORRECTO
import { HeaderContainer, SearchInput } from "./departamentos.styledComponents";
import { HeaderContainer } from "./catalogos.styledComponents"; // Si es compartido

//  INCORRECTO
import { HeaderContainer } from "./departamentos.styledComponents"; // Si el archivo no existe
```

### 4. Eliminación de Componentes

**OBLIGATORIO**: Antes de eliminar un styled component:

1. Buscar todas las referencias en el proyecto
2. Verificar que no se use en otros archivos
3. Si se comparte, moverlo a un archivo compartido antes de eliminar

```bash
# Buscar referencias antes de eliminar
grep -r "ComponentName" src/
```

---

## Reglas de Imports y Exports

### 1. Imports de Componentes

**OBLIGATORIO**: Usar siempre imports desde `@/components`:

```typescript
//  CORRECTO
import { TableCrud, Title, MainLayout } from "@/components";

//  INCORRECTO
import { TableCrud } from "@/components/TableCrud/TableCrud";
```

### 2. Imports de Tipos

**OBLIGATORIO**: Importar tipos desde el mismo lugar que los componentes:

```typescript
//  CORRECTO
import { TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";

//  TAMBIÉN CORRECTO (si está exportado en index)
import type { Column, RowAction } from "@/components";
```

### 3. Verificar Exports en index.ts

**OBLIGATORIO**: Antes de usar un componente, verificar que esté exportado en `src/components/index.ts`:

```typescript
// Si usas un componente nuevo, agregarlo a:
// src/components/index.ts
export { NewComponent } from "./NewComponent";
export type { NewComponentProps } from "./NewComponent";
```

---

## Reglas de TypeScript

### 1. Tipos de Props

**OBLIGATORIO**: Definir interfaces para todas las props:

```typescript
//  CORRECTO
interface TableCrudProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
}

//  INCORRECTO
function TableCrud(props: any) { ... }
```

### 2. Tipos Genéricos

**OBLIGATORIO**: Mantener la consistencia en tipos genéricos:

```typescript
//  CORRECTO
export function TableCrud<T>({ ... }: TableCrudProps<T>) { ... }

//  INCORRECTO
export function TableCrud({ ... }: TableCrudProps) { ... } // Falta <T>
```

### 3. Tipos Opcionales

**OBLIGATORIO**: Marcar como opcionales las props que pueden no estar:

```typescript
//  CORRECTO
interface Props {
  required: string;
  optional?: string;
  callback?: () => void;
}

//  INCORRECTO
interface Props {
  required: string;
  optional: string; // Debería ser optional?
}
```

---

## Reglas de Estructura de Archivos

### 1. Organización de Componentes

**OBLIGATORIO**: Cada componente debe tener su carpeta con:

```
/ComponentName/
  ├── ComponentName.tsx
  ├── styles.ts (o styledComponents.ts)
  └── index.ts
```

### 2. Naming Conventions

**OBLIGATORIO**:
- Componentes: `PascalCase` (ej: `TableCrud.tsx`)
- Archivos de estilos: `styles.ts` o `*.styledComponents.ts`
- Tipos/Interfaces: `PascalCase` (ej: `ColumnType`, `TableCrudProps`)
- Variables: `camelCase` (ej: `searchValue`, `handleClick`)

### 3. Archivos Compartidos

**OBLIGATORIO**: Si los estilos se comparten entre páginas del mismo módulo:

```
/pages/catalogos/
  ├── catalogos.styledComponents.ts   Compartido
  ├── departamentos.tsx
  └── sucursales.tsx
```

---

## Reglas de Estilos y Colores

### 1. Uso del Tema

**OBLIGATORIO**: Usar siempre el tema de MUI (`createTheme` en `src/styles/theme.ts`). Tokens de producto viven en **`palette.app`** (tipo `AppPalette`).

```typescript
//  CORRECTO — styled (@mui/material/styles)
import { styled } from "@mui/material/styles";
export const Card = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  color: theme.palette.text.primary,
}));

//  CORRECTO — constantes a nivel módulo (mismo tema singleton)
import { theme } from "@/styles/theme";
const border = theme.palette.app.border;

//  CORRECTO — componente React
import { useTheme } from "@mui/material/styles";
const theme = useTheme();
<Box sx={{ color: theme.palette.text.secondary }} />

//  INCORRECTO
backgroundColor: "#FFFFFF";
borderColor: "#E4E4E7";
```

### 2. Agregar Nuevos Colores

**OBLIGATORIO**: Definirlos en `src/styles/theme.ts`: actualizar **`appPalette`** (y la interfaz **`AppPalette`** si hace falta), pasar **`app`** en `createTheme({ palette: { …, app: appPalette } })`, y extender **`declare module "@mui/material/styles"`** (`Palette` / `PaletteOptions`) para que TypeScript reconozca `theme.palette.app`. Preferir nombres semánticos (p. ej. bajo `chip.variants`, `sidebar`) en lugar de alias de color sueltos.

---

## Reglas de Componentes

### 1. Props Obligatorias

**OBLIGATORIO**: Verificar que todas las props requeridas estén presentes:

```typescript
//  CORRECTO
<TableCrud
  columns={columns}
  rows={rows}
  rowKey="id"
  loading={loading}
/>

//  INCORRECTO
<TableCrud
  columns={columns}
  rows={rows}
  // Falta rowKey que es obligatorio
/>
```

### 2. Eliminación de Props

**OBLIGATORIO**: Antes de eliminar una prop de un componente:

1. Verificar que no se use en ningún lugar
2. Si es opcional, verificar que no rompa funcionalidad existente
3. Actualizar la interfaz TypeScript

### 3. Cambios en Interfaces

**OBLIGATORIO**: Si cambias una interfaz exportada:

1. Verificar todos los lugares donde se usa
2. Actualizar los tipos en todos los archivos afectados
3. Considerar hacer el cambio backward-compatible (agregar `?` en lugar de eliminar)

---

## Errores Comunes a Evitar

### 1. Imports Faltantes

```typescript
//  ERROR: Componente no importado
import { TableCrud } from "@/components";
// Falta importar Skeleton

//  CORRECTO
import { Skeleton } from "@mui/material";
import { TableCrud } from "@/components";
```

### 2. Exports Faltantes

```typescript
//  ERROR: Componente usado pero no exportado
// En TableCrud.tsx
export function TableCrud() { ... }

// En otro archivo
import { TableCrud } from "@/components"; //  No está en index.ts

//  CORRECTO
// En src/components/index.ts
export { TableCrud } from "./TableCrud";
```

### 3. Styled Components No Exportados

```typescript
//  ERROR: Estilo usado pero no exportado
// En styles.ts
const HeaderContainer = styled(Box)({...}); // Sin export

// En componente
import { HeaderContainer } from "./styles"; //  Error

//  CORRECTO
export const HeaderContainer = styled(Box)({...});
```

### 4. Referencias a Archivos Eliminados

```typescript
//  ERROR: Importando desde archivo eliminado
import { HeaderContainer } from "./departamentos.styledComponents";
// Si el archivo fue eliminado

//  CORRECTO
import { HeaderContainer } from "./catalogos.styledComponents";
```

---

##  Checklist de Validación

Antes de hacer commit o merge, verifica:

- [ ] `npm run build` ejecuta sin errores
- [ ] `npm run lint` no muestra errores
- [ ] Todos los imports están resueltos
- [ ] Todos los exports están correctos
- [ ] No hay referencias a archivos eliminados
- [ ] Los tipos TypeScript están correctos
- [ ] Los styled components están en archivos separados
- [ ] Los colores usan el tema centralizado
- [ ] Los componentes están exportados en `index.ts`

---

## 🔍 Comandos Útiles

```bash
# Verificar errores de TypeScript
npm run type-check

# Verificar linting
npm run lint

# Buscar referencias a un componente
grep -r "ComponentName" src/

# Buscar imports de un archivo
grep -r "from.*archivo" src/
```

---

## 📝 Notas Importantes

1. **Siempre verifica los lints** antes de hacer cambios grandes
2. **Usa `read_lints`** después de modificar archivos
3. **Mantén la consistencia** con el patrón existente
4. **Documenta cambios grandes** en comentarios si es necesario
5. **Prueba los cambios** en el navegador después de compilar

---
