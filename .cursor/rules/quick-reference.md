# Quick Reference - Reglas de Desarrollo

## Checklist Rápido

Antes de modificar código, verifica:

1. **Imports**: ¿Existen todos los componentes/estilos que importo?
2. **Exports**: ¿Están exportados en `index.ts`?
3. **Estilos**: ¿Están en archivo separado `*.styledComponents.ts`?
4. **Colores**: ¿Uso `colors` del tema, no valores hardcodeados?
5. **Tipos**: ¿Las interfaces están correctamente definidas?

---

## Errores Más Comunes

### 1. Importar componente no exportado
```typescript
// Error
import { NewComponent } from "@/components";
// Si no está en src/components/index.ts

// Solución
// Agregar a src/components/index.ts:
export { NewComponent } from "./NewComponent";
```

### 2. Importar desde archivo eliminado
```typescript
// Error
import { HeaderContainer } from "./departamentos.styledComponents";
// Si el archivo fue eliminado

// Solución
import { HeaderContainer } from "./catalogos.styledComponents";
```

### 3. Usar styled component no exportado
```typescript
// Error en styles.ts
const HeaderContainer = styled(Box)({...}); // Sin export

// Solución
export const HeaderContainer = styled(Box)({...});
```

### 4. Color hardcodeado
```typescript
// Error
backgroundColor: "#FFFFFF";

// Solución
import { colors } from "@/styles/theme";
backgroundColor: colors.background.sidebar;
```

---

## Estructura Obligatoria

### Página con Estilos
```
/pages/catalogos/
  ├── departamentos.tsx
  └── departamentos.styledComponents.ts  OBLIGATORIO
```

### Componente
```
/components/ComponentName/
  ├── ComponentName.tsx
  ├── styles.ts
  └── index.ts  OBLIGATORIO (export)
```

---

## Comandos de Validación

```bash
# Verificar errores
npm run build
npm run lint

# Buscar referencias
grep -r "ComponentName" src/
```

---

**Ver documento completo**: `.cursor/rules/development-rules.md`
