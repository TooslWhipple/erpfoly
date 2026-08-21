import { Box } from "@mui/material";

/**
 * Which backend this bundle talks to. Both values are baked in at build time:
 * NEXT_PUBLIC_EPHEMERAL_BACKEND_PR is published by Apifoly's pr-ephemeral-env
 * workflow scoped to the git branch, so its absence means the preview fell back
 * to staging. NEXT_PUBLIC_VERCEL_ENV is exposed by Vercel on every deployment.
 */
const ephemeralBackendPr = process.env.NEXT_PUBLIC_EPHEMERAL_BACKEND_PR?.trim();
const isProductionDeployment =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

/**
 * Always-on marker of the backend behind a preview, so QA never attributes to
 * the front a bug that belongs to a backend without the change. Not dismissable
 * on purpose: the absence of the chip must mean production, nothing else.
 */
export function BackendIndicator() {
  if (isProductionDeployment) {
    return null;
  }

  const label = ephemeralBackendPr
    ? `Backend: PR #${ephemeralBackendPr}`
    : "Backend: staging";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        right: 12,
        // Above modals and snackbars: it must stay readable on every screen.
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        // Never steal a click from the app underneath.
        pointerEvents: "none",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 999,
        backgroundColor: "rgba(17, 24, 39, 0.82)",
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: 0.2,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: ephemeralBackendPr
            ? "success.light"
            : "warning.light",
        }}
      />
      {label}
    </Box>
  );
}
