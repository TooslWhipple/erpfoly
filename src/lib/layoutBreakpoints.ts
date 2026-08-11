/**
 * Shared layout breakpoint tokens. Keep module-specific layout thresholds
 * separate from global app chrome so nav and POS flows can evolve independently.
 *
 * - `NAV_COMPACT_BREAKPOINT`: drawer vs permanent sidebar for most routes.
 * - `SALES_POS_BREAKPOINT`: drawer + compact POS chrome for sales / quotes only
 *   (see `isSalesFlowRoute` and `AppLayoutShell`).
 */
export const NAV_COMPACT_BREAKPOINT = "md" as const;

/** Sales / quotes POS flows use compact chrome below this breakpoint. */
export const SALES_POS_BREAKPOINT = "lg" as const;
