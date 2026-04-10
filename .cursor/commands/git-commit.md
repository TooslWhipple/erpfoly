# git-commit

Genera un mensaje de git commit siguiendo estrictamente estas reglas:

Formato obligatorio:

tipo(ámbito): descripción breve en español [TICKET-123]

Reglas:

Usa SOLO uno de estos tipos:
feat, fix, docs, style, refactor, perf, test, chore

La descripción:

Debe estar en español

Debe ser breve y clara

No usar punto final

Empezar con verbo en infinitivo (ej: agregar, corregir, mejorar, eliminar)

El ámbito:

Opcional, pero recomendado si aplica

Describe el área afectada (ej: auth, ui, api, db, config)

Incluye el ticket entre corchetes al final

NO agregues texto extra

NO agregues saltos de línea

NO agregues explicación

Ejemplos válidos:

feat(auth): agregar validación de sesión expirada [ABC-123]

fix(api): corregir error en la serialización de respuestas [ABC-456]

refactor(ui): reorganizar componentes del dashboard [ABC-789]

Ahora genera el commit basado en los cambios actuales.
