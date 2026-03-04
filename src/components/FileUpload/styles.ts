import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const DropZoneRoot = styled("div")<{ isDragActive: boolean; isError?: boolean }>(
  ({ theme, isDragActive, isError }) => ({
    border: `2px dashed ${isError ? "#DC2626" : isDragActive ? theme.palette.primary.main : colors.border}`,
    borderRadius: 8,
    backgroundColor: isDragActive ? `${theme.palette.primary.main}08` : colors.background.sidebar,
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background-color 0.2s",
    "&:hover": {
      borderColor: isError ? "#DC2626" : theme.palette.primary.light,
      backgroundColor: `${theme.palette.primary.main}06`,
    },
  })
);

export const FileListContainer = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const FileItemRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  "&:last-of-type": {
    marginBottom: 0,
  },
}));

export const FileItemLeft = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  minWidth: 0,
  flex: 1,
}));

export const FileItemActions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  flexShrink: 0,
}));
