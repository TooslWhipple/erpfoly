import { styled } from "@mui/material/styles";
import {
  Box,
  DialogContent as MuiDialogContent,
  IconButton,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
}));

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  color: theme.palette.text.secondary,
  alignSelf: "flex-start",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const ActivityTableWrapper = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  maxHeight: 420,
  overflow: "auto",
}));

export const ActivityTableHeadRow = styled(TableRow)(({ theme }) => ({
  "& th": {
    fontSize: 13,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.app.border}`,
    whiteSpace: "nowrap",
  },
}));

export const ActivityTableBodyRow = styled(TableRow)(({ theme }) => ({
  "& td": {
    fontSize: 14,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.app.border}`,
    verticalAlign: "middle",
  },
  "&:last-of-type td": {
    borderBottom: "none",
  },
}));

export const ArticleCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  minWidth: 0,
}));

export const ArticleThumbnail = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  flexShrink: 0,
  backgroundColor: theme.palette.action.hover,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

export const ArticleName = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 220,
});

export const StateMessage = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(6, 2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
}));
