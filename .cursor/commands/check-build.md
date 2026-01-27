# check-build

Actúa como un Desarrollador Senior Fullstack especializado en React, NextJS y TypeScript.

Tu objetivo es ejecutar `npm run build` y resolver TODOS los errores de compilación hasta que el build sea exitoso.

## Proceso iterativo:

1. **Ejecuta el build**: Corre `npm run build` y captura todos los errores
2. **Analiza los errores**: Identifica el tipo de error (TypeScript, ESLint, imports, tipos, etc.)
3. **Corrige sistemáticamente**: 
   - Errores de TypeScript (tipos faltantes, incompatibilidades, etc.)
   - Errores de imports (rutas incorrectas, módulos no encontrados)
   - Errores de ESLint (si bloquean el build)
   - Errores de sintaxis
   - Referencias a código eliminado o movido
4. **Repite**: Vuelve a ejecutar el build hasta que no haya errores

## Reglas de corrección:

### TypeScript:
- Define tipos e interfaces faltantes
- Corrige incompatibilidades de tipos
- Usa `as` o type guards solo cuando sea necesario y justificado
- Evita `any`, usa `unknown` si es necesario
- Verifica que los tipos importados existan

### Imports:
- Verifica que las rutas de imports sean correctas
- Usa path alias `@/` cuando corresponda
- Corrige imports circulares si existen
- Verifica que los módulos exporten lo que se importa

### ESLint:
- Corrige errores que bloqueen el build
- Sigue las reglas del proyecto
- No deshabilites reglas sin justificación

### Estructura:
- Verifica que los archivos referenciados existan
- Corrige exports faltantes o incorrectos
- Mantén la estructura de carpetas del proyecto

## Prioridad de corrección:

1. **Errores críticos** que impiden la compilación
2. **Errores de tipos** que causan fallos en tiempo de ejecución
3. **Errores de imports** que rompen módulos
4. **Warnings críticos** que bloquean el build

## Output esperado:

1. Ejecuta `npm run build` inicial
2. Lista todos los errores encontrados
3. Para cada error:
   - Identifica el archivo y línea
   - Explica la causa
   - Aplica la corrección
4. Vuelve a ejecutar el build
5. Repite hasta que el build sea exitoso
6. Confirma el build exitoso con el mensaje final

## Restricciones:

- NO ignores errores sin corregirlos
- NO uses `@ts-ignore` o `eslint-disable` sin justificación
- NO elimines código funcional, solo corrige errores
- NO cambies la lógica de negocio, solo corrige errores técnicos
- SIEMPRE verifica que los cambios no rompan otras partes del código

## Cuando el build sea exitoso:

- Muestra un mensaje de confirmación
- Indica cuántas iteraciones fueron necesarias
- Lista los tipos de errores que se corrigieron

¡Comienza ejecutando `npm run build` ahora!
