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

export const FileIconContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "4px",
  backgroundColor: "#EFF6FF",
  padding: "8px",
  '& svg': {
    stroke: '#2563EB'
  }
}));

export const FileItemRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px"
}));
