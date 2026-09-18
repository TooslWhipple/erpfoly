# Plan de remediación de seguridad — Folysoft Frontend

**Documento base:** `SECURITY_AUDIT_OWASP_SOC2.md` (auditoría estática al commit `db94696`, 2026-08-21)
**Re-auditoría:** commit `9a565c3`, rama `feature/owasp`, 2026-09-17
**Marcos:** OWASP Top 10 (2021) · SOC 2 Trust Services Criteria

---

## 1. Resumen ejecutivo

Desde la auditoría original se cerró **la mayor parte del trabajo de arquitectura de sesión**, que era la parte difícil. El JWT ya no vive en `localStorage`, hay cabeceras de seguridad, existe `middleware.ts`, la revalidación de sesión corre por intervalo y por foco de ventana, los timeouts están diferenciados y la PII salió del almacenamiento del navegador.

Lo que queda pendiente es, en su mayoría, **configuración y proceso** — más barato que lo ya hecho, pero incluye los dos riesgos más graves del repositorio hoy:

| Prioridad | Riesgo | Por qué ahora |
|---|---|---|
| 🔴 **Inmediato** | Un **Personal Access Token de GitHub en texto plano** dentro de `.git/config` | Credencial viva con acceso de escritura al repositorio |
| 🔴 **Inmediato** | `next` con **RCE no autenticado** (severidad crítica, parche disponible) | Vulnerabilidad explotable en el framework mismo |
| 🟠 Alto | **Sigue sin existir CI** (`.github/` ausente) | Es la brecha SOC 2 CC8.1, la más citada por auditores |
| 🟠 Alto | **`eslint` falla con 186 errores** | Bloquea poder exigir lint en CI; hay que resolverlo antes de poder cerrar la brecha anterior |

**Conteo actual:** 2 críticos · 3 altos · 6 medios · 5 bajos.
**Cerrados desde la auditoría original:** 1 alto y 5 medios/bajos (ver §2).

> **Nota de alcance.** El hallazgo `API/C-1` del backend (el guard de permisos retorna `true` antes de evaluar) sigue siendo el riesgo dominante del sistema completo y **no se puede cerrar desde este repositorio**. Todo lo que sigue es defensa en profundidad mientras eso se arregla. Ver §5.

---

## 2. Estado de los hallazgos originales

Verificado contra el código en `9a565c3`.

| ID | Hallazgo original | Estado | Evidencia |
|---|---|---|---|
| **H-1** | JWT en `localStorage` | ✅ **Cerrado** | `useAuthStore.ts:98-102` solo persiste `isAuthenticated` + `PersistedUser`; el token es el centinela `"cookie"`. `axios.ts:37` usa `withCredentials: true` y la inyección de `Authorization` se eliminó |
| **H-2** | Sin cabeceras de seguridad | 🟡 **Parcial** | `securityHeaders.ts` aplica HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. **La CSP sigue en `Report-Only` y sin endpoint de reporte** → ver N-3 |
| **H-3** | Autorización 100 % cliente | 🟡 **Parcial** | `src/middleware.ts` ya rechaza rutas protegidas sin cookie en el borde. La parte de servidor real depende de `API/C-1` |
| **H-4** | 23 vulnerabilidades (14 altas) | 🟡 **Mejorado, pero ahora hay 1 crítica** | `axios@1.18.1`, `next@16.2.10`. `npm audit` hoy: 1 crítica · 3 altas · 1 moderada, **todas con parche disponible** → ver N-2 |
| **H-5** | Sin pipeline de CI | 🔴 **Abierto** | `.github/` no existe. Único hook: `.husky/commit-msg` (commitlint). Sin lint, sin `tsc`, sin build, sin audit, sin gitleaks |
| **M-1** | Bypass de auth y `DEV_MOCK_USER` en el bundle | 🔴 **Abierto** | `accessControl.ts:21` sigue exportando los 40+ permisos, importado estáticamente en `AuthGuard.tsx:6`. `dev-mock-user` aparece en `.next/static/chunks/` |
| **M-2** | `user.permissions` desde `localStorage` | 🟡 **Mitigado por diseño** | Se sigue persistiendo, pero `/auth/me` lo sobrescribe en cada carga y cada 5 min. Aceptable **mientras la UI no sea el control de seguridad** |
| **M-3** | Revalidación acepta tokens revocados | ✅ **Cerrado del lado frontend** | `AuthGuard.tsx:155-170` revalida en `focus` y cada `SESSION_REVALIDATE_MS` (5 min). El resto depende de `API/H-12` |
| **M-4** | Clave de Google Maps en el bundle | 🟡 **Documentado, sin verificar** | `docs/GOOGLE_MAPS_KEY_HARDENING.md` existe con el checklist **sin marcar**; la configuración en GCP no está confirmada |
| **M-5** | Sin expiración local del token | ✅ **Cerrado** | Flujo de refresh en `axios.ts:222-247` + revalidación periódica |
| **M-6** | `console.*` en producción | 🔴 **Abierto** | **86 llamadas en 49 archivos** (75 `console.error`, 10 `console.log`, 1 `console.warn`). Sin logger, sin telemetría |
| **M-7** | Reintento de 429 hasta 3 veces | 🟡 **Mejorado** | Sigue en 3 reintentos (`axios.ts:61`), pero ahora respeta la cabecera `Retry-After` |
| **B-1** | `window.open` sin `noopener` | ✅ **Cerrado** | Los 3 call sites (`FileUpload.tsx:290`, `Sidebar.tsx:67`, `DocumentationTab.tsx:184`) usan `"noopener,noreferrer"` |
| **B-2** | PII persistida en `localStorage` | ✅ **Cerrado** | `PersistedUser` excluye `name`, `email` y `avatar` |
| **B-3** | Timeout uniforme de 10 s | ✅ **Cerrado** | `API_TIMEOUT_MS`: 15 s default, 120 s para uploads y reportes, con detección automática |
| **B-4** | Sin `.env.example` | ✅ **Cerrado** | `.env.example` presente y documentado |

**Balance:** 6 cerrados · 5 parciales · 3 abiertos.

---

## 3. Hallazgos nuevos de esta re-auditoría

### N-1 · 🔴 Crítico — Personal Access Token de GitHub en texto plano

`.git/config` tiene la URL del remoto con credenciales embebidas:

```
origin  https://azamudio65:ghp_****************@github.com/TooslWhipple/erpfoly.git
```

Ese token da **acceso de escritura al repositorio** a cualquiera que lea el archivo: un respaldo de la máquina, un `git remote -v` en una sesión compartida, un volcado de logs, o cualquier herramienta con acceso al working tree. No está commiteado (los `.env*` están correctamente en `.gitignore` y nunca entraron al historial), pero eso no reduce el riesgo: la credencial está viva.

Un auditor de SOC 2 clasifica esto como falla de **CC6.1** (gestión de credenciales) y **CC6.8**. OWASP: **A07**.

**Remediación — hoy, no esta semana:**
1. Revocar el token en GitHub → *Settings → Developer settings → Personal access tokens*. Asumir que está comprometido.
2. Reescribir el remoto sin credenciales: `git remote set-url origin https://github.com/TooslWhipple/erpfoly.git`.
3. Migrar a un método que no deja secretos en archivos de texto: SSH con passphrase, o `gh auth login`, o el keychain de macOS vía `git config --global credential.helper osxkeychain`.
4. Revisar el log de auditoría de la organización por actividad no reconocida con ese token.
5. Comunicarlo al equipo: si un desarrollador lo hizo así, es probable que otros también.

### N-2 · 🔴 Crítico — `next` con RCE no autenticado

```
$ npm audit
1 critical · 3 high · 1 moderate
```

| Paquete | Sev. | Vulnerabilidad | Parche |
|---|---|---|---|
| **`next`** | 🔴 Crítica | RCE no autenticado en servidores Windows; **RCE no autenticado en la Image Optimization API con archivos AVIF** | Disponible |
| `fast-uri` | Alta | SSRF por normalización de IPv6 y confusión de host | Disponible |
| `js-yaml` | Alta | DoS por CPU en merge keys | Disponible |
| `sharp` | Alta | CVEs heredadas de libheif | Disponible |
| `@humanfs/node` | Moderada | Copia recursiva sigue symlinks fuera del árbol | Disponible |

La CVE de Image Optimization es la que importa aquí: es el framework en producción y no requiere autenticación. `fast-uri`, `js-yaml` y `@humanfs/node` son transitivas de la cadena de build (impacto menor, pero el arreglo es gratis).

**Remediación:** `npm audit fix` cubre las cinco. Subir `next` dentro de la línea 16.x es un salto de parche, no de mayor. Verificar con `tsc --noEmit` + `next build` después.

### N-3 · 🟠 Alto — La CSP no protege ni mide nada

`securityHeaders.ts:46` emite `Content-Security-Policy-Report-Only`, **sin `report-uri` ni `report-to`**. El resultado es el peor de los dos mundos: no bloquea nada (es Report-Only) y no recolecta nada (no hay dónde reportar). Las violaciones solo aparecen en la consola del navegador de quien esté mirando, así que no hay evidencia acumulada con la cual decidir promoverla a modo enforcing.

También sigue con `script-src 'unsafe-inline'`, que es lo que anula su valor contra XSS inyectado.

**Nota:** `style-src 'unsafe-inline'` sí es obligatorio con Emotion (el motor de MUI) y los auditores lo aceptan. Eso no se toca.

### N-4 · 🟠 Alto — `eslint` falla y bloquea la puerta de CI

```
$ npx eslint .
✖ 363 problems (186 errors, 177 warnings)
```

Esto es un problema de **secuencia**: no se puede exigir `lint` en CI (H-5) mientras falle, y H-5 es la brecha SOC 2 más costosa del repositorio. Desglose:

| Regla | Errores | Naturaleza |
|---|---|---|
| `react-hooks/set-state-in-effect` | 120 | Correctitud real. Con `reactCompiler: true` activo, el compilador se rinde en estos componentes |
| `@typescript-eslint/no-explicit-any` | 30 | Contradice la regla del proyecto de no usar `any` |
| `react-hooks/refs` | 15 | Correctitud |
| `react-hooks/preserve-manual-memoization` | 6 | Performance |
| `react-hooks/immutability` | 6 | Correctitud |
| `@typescript-eslint/no-empty-object-type` | 4 | Cosmético |
| `react/jsx-key`, `react/no-unescaped-entities`, `prefer-const` | 5 | Cosmético |

Y 177 warnings, 155 de ellos `no-unused-vars` (mayoría `theme` sin usar en archivos de estilos).

**En positivo:** `tsc --noEmit` pasa limpio. La puerta de tipos se puede exigir en CI hoy mismo, sin trabajo previo.

### N-5 · 🟡 Medio — Dos lockfiles y ningún `packageManager`

`package-lock.json` (318 KB) y `pnpm-lock.yaml` (208 KB) coexisten, y `package.json` no declara el campo `packageManager`. Cuál se usa depende de qué comando corra cada desarrollador y de qué detecte la plataforma de hosting. Eso significa que **el árbol de dependencias no es reproducible**, y ninguno de los dos lockfiles es la fuente de verdad. Un `npm audit` limpio no dice nada sobre lo que se instaló con pnpm, ni al revés.

OWASP **A08** (fallas de integridad), SOC 2 **CC8.1**.

### N-6 · 🟡 Medio — Cero tests y cero telemetría de errores

No hay script `test` en `package.json`, ningún runner instalado (`vitest`/`jest`/`playwright` ausentes), y ningún archivo de test en el repositorio. Tampoco hay Sentry ni equivalente: **los fallos en producción son invisibles**, y los 86 `console.error` de M-6 se pierden en la consola del usuario.

Para SOC 2 son dos criterios distintos: **CC8.1** pide evidencia de pruebas previas al despliegue, **CC7.2** pide monitoreo de anomalías. Hoy no hay nada que presentar en ninguno.

### N-7 · 🟢 Bajo — Endurecimientos menores acumulados

| # | Detalle |
|---|---|
| a | `middleware.ts:31` deja pasar sin verificar cookie cualquier ruta que contenga un punto (`pathname.includes(".")`). Es un allowlist frágil para saltarse assets; conviene restringirlo al `matcher` por extensión, que ya hace ese trabajo |
| b | `axios.ts:210-218` y `:240-241` conservan código muerto que inyecta `Authorization: Bearer` en la cola de refresh, mientras `setToken` descarta el token recibido. Es inconsistente con el modelo de cookie y es exactamente el tipo de resto que reintroduce autenticación por cabecera en un refactor futuro |
| c | `next.config.ts:35` sigue exponiendo el legado `GOOGLE_MAPS_API_KEY` vía `env`, y `AddressSection.tsx:18` es el único consumidor que lo lee sin prefijo `NEXT_PUBLIC_`. `docs/GOOGLE_MAPS_KEY_HARDENING.md` ya pide converger a un solo nombre |
| d | Sin protección de rama en `development` ni `main` (a verificar en GitHub; no hay `gh` instalado localmente para confirmarlo) |

---

## 4. Plan por fases

Ordenado de menor a mayor esfuerzo, con la excepción de N-1 y N-2: son críticos y además baratos, así que abren la lista por ambas razones.

Cada fase es independiente y desplegable por sí sola.

---

### Fase 0 — Contención inmediata · ~2 h · hoy

| # | Acción | Cierra | Esfuerzo |
|---|---|---|---|
| 0.1 | Revocar el PAT de GitHub, limpiar la URL del remoto, migrar a SSH o keychain, revisar el audit log de la organización | **N-1** | 30 min |
| 0.2 | `npm audit fix` → subir `next` al parche que cierra el RCE. Verificar con `tsc --noEmit` + `next build` | **N-2** | 1 h |
| 0.3 | Elegir **un** gestor de paquetes, borrar el otro lockfile, declarar `"packageManager"` en `package.json` | **N-5** | 20 min |

**Ganancia:** se eliminan los dos únicos hallazgos críticos y el árbol de dependencias pasa a ser reproducible — que es prerrequisito para que el `audit` de la Fase 1 signifique algo.

---

### Fase 1 — CI mínima verificable · ~3 h · esta semana

Objetivo: cerrar **CC8.1**, la brecha SOC 2 más probable de este repositorio. La clave es **empezar solo con las puertas que hoy pasan** en lugar de esperar a arreglar los 186 errores de lint.

| # | Acción | Cierra | Esfuerzo |
|---|---|---|---|
| 1.1 | `.github/workflows/ci.yml` en PRs a `development` y `main` con: `tsc --noEmit` (pasa hoy) · `build` · `audit --audit-level=high` · `gitleaks` | **H-5** | 1.5 h |
| 1.2 | Añadir `eslint` al workflow en modo **no bloqueante** (`continue-on-error: true`) para tener la línea base visible en cada PR | N-4 | 15 min |
| 1.3 | Activar protección de rama: PR obligatorio, 1 aprobación, checks en verde para mergear | **H-5**, N-7d | 20 min |
| 1.4 | Hook `pre-push` de husky con `tsc --noEmit`, para feedback antes del PR | H-5 | 20 min |
| 1.5 | Completar el checklist de `docs/GOOGLE_MAPS_KEY_HARDENING.md` en GCP: restricción por referrer, restricción por API, cuota diaria. Adjuntar captura como evidencia | **M-4** | 30 min |

**Ganancia:** a partir de aquí, ningún PR entra sin verificación automatizada, y `gitleaks` habría detectado N-1. La respuesta a *"muéstrame que este cambio fue probado"* deja de ser la palabra del desarrollador.

> **Decisión de diseño:** `audit --audit-level=high` bloqueante desde el día 1 es viable **solo si la Fase 0 se completó primero**. Si no, el workflow nace rojo y el equipo aprende a ignorarlo — que es peor que no tenerlo.

---

### Fase 2 — Limpieza de bundle y observabilidad · ~1 semana

| # | Acción | Cierra | Esfuerzo |
|---|---|---|---|
| 2.1 | `noopener` ya está; aplicar los endurecimientos menores: `matcher` del middleware, código muerto de Bearer en `axios.ts`, converger `GOOGLE_MAPS_API_KEY` a `NEXT_PUBLIC_*` | **N-7a/b/c** | 2 h |
| 2.2 | Mover `DEV_MOCK_USER` a su propio módulo con `import()` dinámico bajo `shouldBypassAccessControl`, para que el minificador lo elimine del build de producción. **Verificar con `rg "dev-mock-user" .next/static`** tras un build limpio | **M-1** | 3 h |
| 2.3 | `src/lib/logger.ts` que en producción no emita a consola y en desarrollo se comporte como hoy. Sustituir los 86 `console.*`; regla `no-console` en eslint para que no vuelvan | **M-6** | 4 h |
| 2.4 | Instalar Sentry (o equivalente) con redacción de PII, conectado al logger de 2.3 | **N-6**, CC7.2 | 4 h |
| 2.5 | Endpoint `/api/csp-report` + `report-uri`/`report-to` en la CSP, para empezar a acumular violaciones reales | **N-3** (paso 1) | 2 h |

**Ganancia:** el modelo de autorización deja de ser público en el bundle, y por primera vez hay visibilidad de lo que falla en producción. 2.5 no arregla nada por sí solo — habilita la Fase 3.

---

### Fase 3 — CSP enforcing y calidad gateable · ~3 semanas

| # | Acción | Cierra | Esfuerzo |
|---|---|---|---|
| 3.1 | Recolectar violaciones de CSP **una semana** con el endpoint de 2.5, ajustar directivas, y promover el header de `Report-Only` a `Content-Security-Policy` | **H-2** | 1 semana (calendario) |
| 3.2 | Resolver los 186 errores de eslint por tanda, empezando por los 120 `react-hooks/set-state-in-effect` — que además desbloquean al React Compiler en esos componentes. Luego los 30 `any` | **N-4** | 3–4 días |
| 3.3 | Con lint verde: quitar `continue-on-error` de 1.2 y añadir `--max-warnings` con la línea base de warnings | **N-4**, H-5 | 30 min |
| 3.4 | Instalar Vitest y escribir tests para la superficie donde un bug cuesta dinero: `routeAccess.ts`, `usePermissions.ts`, el interceptor de `axios.ts`, y los mappers financieros. **No** perseguir cobertura global | **N-6**, CC8.1 | 1 semana |

**Ganancia:** aquí se cierra H-2 completo y CC8.1 pasa de "hay CI" a "hay CI con pruebas". El orden importa: 3.2 antes de 3.3, o la puerta nace roja.

---

### Fase 4 — Endurecimiento final · ~1–2 meses

| # | Acción | Cierra | Esfuerzo |
|---|---|---|---|
| 4.1 | Eliminar `script-src 'unsafe-inline'` con nonces por petición vía `_document.tsx`. `style-src 'unsafe-inline'` se queda: es obligatorio con Emotion | **H-2** (residual) | 3–5 días |
| 4.2 | Backoff exponencial + jitter en los reintentos de 429, y tope global de reintentos concurrentes para no amplificar carga bajo estrés | **M-7**, A1.1 | 1 día |
| 4.3 | Política de retención de `localStorage`: purgar el perfil al cerrar sesión y documentar qué se guarda y por cuánto | **M-2** residual, C1.1 | 1 día |
| 4.4 | Escaneo de dependencias programado (Dependabot o `npm audit` semanal en CI) para no volver a acumular un backlog como H-4 | CC7.1 | 2 h |
| 4.5 | Una vez arreglado `API/C-1`: revisar que `canAccessPath` esté documentado en el código como **mejora de UX, nunca control de seguridad**, para que nadie construya encima con la suposición contraria | **H-3** | 2 h |

---

## 5. Dependencias con el backend (`apifoly`)

Estos hallazgos **no se pueden cerrar desde este repositorio**, y conviene tenerlos visibles para no reportar como resuelto lo que no lo está:

| Hallazgo | Depende de | Situación real mientras no se arregle |
|---|---|---|
| **H-3** — autorización efectiva | `API/C-1`: `PermissionsGuard` retorna `true` antes de evaluar | Cualquier usuario con un token válido, sea cual sea su rol, ejecuta cualquier operación vía `curl`. No necesita XSS ni robar nada: solo conocer la ruta |
| **M-3** — revocación efectiva | `API/H-12`: `/auth/me` acepta tokens revocados | Revocar un acceso tarda hasta 12 h en surtir efecto. La revalidación cada 5 min del frontend acorta la ventana de *detección*, no la de *validez* |
| **H-1** — cookie `httpOnly` real | La API debe emitir la cookie | El frontend ya está migrado y asume la cookie. **Confirmar que el backend efectivamente emite `httpOnly; Secure; SameSite=Lax`** y que el nombre coincide con `ACCESS_TOKEN_COOKIE_NAME` (`middleware.ts:16`, default `accessToken`) — si no coincide, el middleware redirige a login en bucle |
| CSRF | `SameSite=Lax` + token de doble envío en mutaciones sensibles | Con cookies, `SameSite=Lax` cubre la mayoría de los casos; las operaciones de caja y aprobación de crédito merecen la defensa explícita |

**El orden correcto sigue siendo backend primero.** Endurecer el frontend mientras `API/C-1` siga activo mejora la postura aparente sin cambiar la exposición real.

---

## 6. Cobertura proyectada

| # | OWASP 2021 | Hoy | Tras Fase 1 | Tras Fase 3 |
|---|---|---|---|---|
| A01 | Broken Access Control | 🔴 | 🔴 | 🟠 *(techo: `API/C-1`)* |
| A02 | Cryptographic Failures | 🟢 | 🟢 | 🟢 |
| A03 | Injection | 🟢 | 🟢 | 🟢 |
| A04 | Insecure Design | 🟠 | 🟠 | 🟡 |
| A05 | Security Misconfiguration | 🟠 | 🟠 | 🟢 |
| A06 | Vulnerable Components | 🔴 | 🟢 | 🟢 |
| A07 | Auth Failures | 🔴 *(N-1)* | 🟢 | 🟢 |
| A08 | Integrity Failures | 🟠 *(N-5)* | 🟢 | 🟢 |
| A09 | Logging & Monitoring | 🔴 | 🔴 | 🟢 |
| A10 | SSRF | 🟢 | 🟢 | 🟢 |

| Criterio SOC 2 | Hoy | Tras Fase 1 | Tras Fase 3 | Bloqueante restante |
|---|---|---|---|---|
| CC6.1 Acceso lógico | 🔴 | 🟠 | 🟠 | `API/C-1`, `API/H-12` |
| CC6.3 Menor privilegio | 🟠 | 🟠 | 🟠 | `API/C-1` |
| CC6.6 Perímetro | 🟡 | 🟡 | 🟢 | — |
| CC6.7 Protección de datos | 🟢 | 🟢 | 🟢 | — |
| CC7.1 Config. vulnerables | 🔴 | 🟢 | 🟢 | — |
| CC7.2 Monitoreo | 🔴 | 🔴 | 🟢 | — |
| **CC8.1 Gestión de cambios** | 🔴 | 🟡 | 🟢 | — |
| A1.1 Disponibilidad | 🟡 | 🟡 | 🟡 | Fase 4.2 |
| C1.1 Confidencialidad | 🟢 | 🟢 | 🟢 | — |

---

## 7. Evidencia a conservar para la auditoría

Los controles solo cuentan si son demostrables. Por fase:

- **Fase 0** — Captura de la revocación del PAT en GitHub. Salida de `npm audit` antes y después. Commit que elimina el lockfile duplicado.
- **Fase 1** — Captura de la configuración de protección de rama. Un PR de ejemplo con todos los checks en verde. Checklist de GCP firmado y fechado.
- **Fase 2** — `rg "dev-mock-user" .next/static` sin resultados tras un build limpio. Un evento de prueba llegando a Sentry.
- **Fase 3** — Log de violaciones de CSP de la semana de observación, con la decisión de qué directivas se ajustaron. Salida de la suite de tests en CI.
- **Fase 4** — Configuración del escaneo programado de dependencias. Política de retención de datos del navegador, escrita.

---

*Re-auditoría estática al commit `9a565c3` de la rama `feature/owasp`. Los hallazgos se verificaron leyendo el código y ejecutando `npm audit`, `tsc --noEmit` y `eslint`; no se explotaron contra un entorno desplegado. Fuera de alcance: configuración de la plataforma de hosting (cabeceras a nivel de plataforma, variables de entorno, protección de previews), la configuración real de la clave de Maps en GCP, y el estado de la protección de ramas en GitHub — los tres deben confirmarse en sus respectivas consolas.*
