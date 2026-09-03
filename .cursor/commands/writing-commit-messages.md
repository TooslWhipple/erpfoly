---
name: writing-commit-messages
description: Analiza los cambios locales, crea un commit con mensaje convencional en español y lo ejecuta en folysoft-frontend. Usar cuando el usuario pida hacer commit, commitear cambios, o invoque @writing-commit-messages.
user-invocable: true
---

# Commit de cambios

Al invocarse, **ejecuta el commit** de los cambios actuales. No basta con sugerir un mensaje.

Trabaja siempre desde la raíz del repositorio (`folysoft-frontend`).

## Flujo obligatorio

1. En paralelo, ejecuta:
   - `git status`
   - `git diff` (staged y unstaged)
   - `git log -10 --oneline`
2. Analiza los cambios y redacta **un mensaje puntual** que describa el cambio lógico realizado.
3. Añade al staging solo archivos relevantes al cambio.
4. Crea el commit con el mensaje usando HEREDOC.
5. Ejecuta `git status` para confirmar que el commit se creó correctamente.

## Protocolo de seguridad git

- **NUNCA** modifiques la configuración de git.
- **NUNCA** ejecutes comandos destructivos (`push --force`, `reset --hard`, etc.) salvo que el usuario lo pida explícitamente.
- **NUNCA** uses `--no-verify` ni `--no-gpg-sign` salvo que el usuario lo pida explícitamente.
- **NUNCA** hagas `push` salvo que el usuario lo pida explícitamente.
- **NUNCA** commitees archivos con secretos (`.env`, credenciales, tokens, claves).
- **NUNCA** crees un commit vacío si no hay cambios.
- Evita `git commit --amend` salvo que el usuario lo pida y se cumplan todas las condiciones de seguridad.

## Formato del mensaje

```
tipo(ámbito): descripción breve en español [TICKET-123]
```

### Reglas

- **Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
- **Idioma:** español
- **Verbo:** infinitivo (agregar, corregir, mejorar, eliminar, actualizar, refactorizar)
- **Longitud:** ~72 caracteres máximo en la línea de asunto
- **Sin punto final**
- **Ámbito:** opcional pero recomendado (auth, ui, rutas, layout, notificaciones, api, etc.)
- **Ticket:** incluir entre corchetes al final si aparece en la rama, el contexto o lo menciona el usuario; omitir si no se conoce
- **Una sola línea** (sin cuerpo ni pies salvo breaking changes)
- **Un commit = un cambio lógico**; no mezclar refactor con feature en el mismo commit

### Ejemplos válidos

```
feat(rutas): asignar vehículos desde la pestaña de conductor
feat(layout): colapsar sidebar y reubicar inbox
fix(api): corregir error en la serialización de respuestas
refactor(ui): reorganizar componentes del dashboard
chore(deps): actualizar dependencias de notificaciones
```

### Ejemplos inválidos

```
fixed stuff
WIP
update
cambios varios
feat: se hicieron cosas
```

## Cómo redactar el mensaje

- Resume **qué cambió** de forma concreta, no genérica.
- Usa el diff como fuente de verdad, no supongas.
- Elige el tipo según el impacto real:
  - `feat` → funcionalidad nueva visible para el usuario
  - `fix` → corrección de bug
  - `refactor` → reestructuración sin cambio de comportamiento
  - `chore` / `ci` → tooling, deps, pipelines, config
- Si hay cambios no relacionados, commitea solo el bloque coherente y avisa al usuario sobre el resto.

## Cuándo NO commitear

- No hay cambios que commitear.
- El código está a medias o claramente roto (avisar al usuario; sugerir `git stash` si aplica).
- Solo hay archivos sensibles modificados.
- Los cambios mezclan varios temas no relacionados → proponer commits separados.

## Breaking changes

Si el cambio rompe compatibilidad:

```
feat(api)!: cambiar formato del token de autenticación

BREAKING CHANGE: migrar clientes al nuevo header Authorization
```

## Ejemplo de commit

```bash
git add <archivos-relevantes>

git commit -m "$(cat <<'EOF'
feat(layout): colapsar sidebar y reubicar inbox

EOF
)"
```

Tras el commit, informa al usuario el hash corto, el mensaje usado y si quedaron cambios sin commitear.
