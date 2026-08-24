# Google Maps API Key — Endurecimiento en GCP

La clave de Maps **siempre será visible** en el bundle del cliente (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`). El control de seguridad está en **Google Cloud Console**, no en ocultar la key en el código.

## Checklist (completar en GCP)

### 1. Restricción por HTTP referrers

En [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials):

- [ ] Producción: `https://<dominio-prod>/*`
- [ ] Previews Vercel: `https://*.vercel.app/*` (o dominios concretos del team)
- [ ] Desarrollo local (opcional): `http://localhost:*/*`

### 2. Restricción de APIs

Limitar la key a solo las APIs usadas por Folysoft:

- [ ] Maps JavaScript API
- [ ] Geocoding API (si aplica — `geocode-municipality.ts`, `geocodeAddress.ts`)
- [ ] Places API (si aplica en formularios de dirección)

### 3. Cuotas y billing

- [ ] Cuota diaria configurada por API
- [ ] Alertas de presupuesto en GCP Billing
- [ ] Revisión mensual de uso anómalo

## Variables de entorno

Preferir un solo nombre en el frontend:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=...   # AdvancedMarkerElement
```

El fallback `GOOGLE_MAPS_API_KEY` en `next.config.ts` / `config/maps.ts` existe por compatibilidad; en nuevos entornos usar solo `NEXT_PUBLIC_*`.

## Evidencia para auditoría

Adjuntar captura o nota con:

- Fecha de revisión
- Dominios en allowlist
- APIs habilitadas
- Cuota configurada
