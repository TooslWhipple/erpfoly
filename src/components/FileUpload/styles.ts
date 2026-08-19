import { styled, darken } from "@mui/material/styles";

export const DropZoneRoot = styled("div")<{
  isDragActive: boolean;
  isError?: boolean;
  fullHeight?: boolean;
}>(
  ({ theme, isDragActive, isError, fullHeight }) => ({
    border: `2px dashed ${(isError) ? "#DC2626" : (isDragActive) ? darken(theme.palette.primary.main, 0.06) : theme.palette.primary.main}`,
    borderRadius: "12px",
    backgroundColor: ((isDragActive) ? darken("EFF6FF", 0.06) : "#EFF6FF"),
    padding: "24px 12px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background-color 0.2s",
    boxSizing: "border-box",
    ...(fullHeight && {
      flex: 1,
      height: "100%",
      minHeight: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    "&:hover": {
      borderColor: (isError) ? "#DC2626" : darken(theme.palette.primary.main, 0.06),
      backgroundColor: darken("#EFF6FF", 0.06),
    },
  })
);

export const FileListContainer = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const FileIconContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "4px",
  backgroundColor: "#EFF6FF",
  padding: "8px",
  // Sin esto el icono se comprime cuando el nombre del archivo es largo.
  flexShrink: 0,
  '& svg': {
    stroke: '#2563EB'
  }
});

export const FileItemRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  // El card no puede crecer más que su contenedor: sin esto un nombre de
  // archivo largo empuja las acciones fuera del borde derecho.
  boxSizing: "border-box",
  maxWidth: "100%",
  overflow: "hidden"
}));

/**
 * Bloque izquierdo del card (icono + nombre). `minWidth: 0` es lo que permite
 * que el nombre se trunque en vez de estirar la fila: un item de flex no baja
 * de su tamaño de contenido mientras conserve el `min-width: auto` por defecto.
 */
export const FileItemInfo = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
  flex: 1
});

/** Bloque derecho del card (acciones). Nunca se comprime ni se desborda. */
export const FileItemActions = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "12px",
  flexShrink: 0
});
