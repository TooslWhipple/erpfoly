# create-module-from-screenshot

Actúa como un Desarrollador Frontend Senior especializado en React y NextJS.

Voy a compartir una screenshot de una pantalla diseñada en Figma.
Tu objetivo es IMPLEMENTAR esa pantalla en código, siguiendo estas reglas:

Objetivo:
- Interpretar la pantalla visualmente
- NO copiar pixel-perfect
- Mantener coherencia con el diseño existente del proyecto
- Reutilizar componentes existentes siempre que sea posible

Reglas de diseño:
1. Respeta la jerarquía visual (títulos, secciones, acciones)
2. Usa spacing, tipografía y layout similares, no exactos
3. Sigue el patrón de diseño ya establecido en el proyecto
4. Evita estilos hardcodeados fuera del sistema

Componentes:
- Identifica primero componentes reutilizables existentes
- Si un componente no existe, créalo siguiendo:
  - Naming conventions del proyecto
  - Patrón de Material UI
  - Enfoque reutilizable
- NO crees componentes específicos si pueden ser genéricos
- Utiliza el componente Typography de Material UI con su prop variant
- NO crees styledComponents de Typography, utiliza la variante más similar a lo que se necesite
- NO utilices el componente Box, en su lugar puedes utilizar Stack o div 
- NO crees styledComponents de layours div sí se puede resolver con Stack
- NO crees styledComponents de Buttons, utiliza sus variantes
- Utiliza los iconos de lucide-react


Datos y lógica:
- Genera data dummy realista y coherente
- Simula conexión a APIs usando:
  - servicios mock
  - hooks personalizados
  - funciones fake async

- Implementa estados:
  - loading
  - success
  - empty
  - error

Arquitectura:
- UI libre de lógica de negocio
- Data fetching desacoplado
- Usa TypeScript con interfaces claras
- Organización por archivos

Interacción:
- Botones y acciones deben funcionar (aunque sean mock)
- Formularios deben validar datos básicos
- Navegación simulada si aplica

Output esperado:
1. Breve análisis de la pantalla
2. Lista de componentes reutilizados
3. Lista de componentes nuevos (si aplica)
4. Código organizado por archivos
5. Explicación corta de decisiones clave

Restricciones:
- No pixel-perfect
- No hacks visuales
- No respuestas junior
- Piensa en producción

Si la screenshot es ambigua:
- Asume el caso más común de un e-commerce financiero
- Prioriza mantenibilidad y escalabilidad
