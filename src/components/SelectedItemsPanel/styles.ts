import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton, Button, Divider } from '@mui/material';

export const PanelContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxHeight: '100vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.lowGray,
  borderRadius: '16px',
  border: `1px solid ${theme.palette.app.border}`,
}));

export const PanelHeader = styled(Box)(({ theme }) => ({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}));

export const ItemsList = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export const ItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.palette.app.border}`,
}));

export const ItemImage = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '8px',
  objectFit: 'cover',
  border: `1px solid ${theme.palette.app.border}`,
  flexShrink: 0,
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ItemInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const ItemCode = styled(Typography)({
  fontSize: 11,
  color: 'text.secondary',
  fontFamily: 'monospace',
});

export const ItemName = styled(Typography)({
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

export const ItemPrice = styled(Typography)({
  fontSize: 12,
  color: 'text.secondary',
});

export const ItemTotal = styled(Typography)({
  fontSize: 13,
  fontWeight: 600,
  color: 'primary.main',
});

export const RemoveButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  color: theme.palette.text.disabled,
  '&:hover': {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.main + '10',
  },
}));

export const StepperContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  marginTop: 4,
});

export const StepperButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  width: 28,
  height: 28,
  borderRadius: 6,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    borderColor: theme.palette.primary.main,
  },
}));

export const StepperInput = styled('input')(({ theme }) => ({
  width: 40,
  height: 28,
  textAlign: 'center',
  border: `1px solid ${theme.palette.app.border}`,
  borderLeft: 'none',
  borderRight: 'none',
  borderRadius: 0,
  fontSize: 13,
  fontWeight: 500,
  outline: 'none',
  backgroundColor: theme.palette.background.paper,
  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
  },
  MozAppearance: 'textfield',
}));

export const PanelFooter = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderTop: `1px solid ${theme.palette.app.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}));

export const TotalRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const EmptyState = styled(Box)(({ theme }) => ({
  padding: '32px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: theme.palette.text.secondary,
}));
