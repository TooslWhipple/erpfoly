import { styled } from '@mui/material/styles';
import { Typography, IconButton } from '@mui/material';

export const PanelContainer = styled('div')(({ theme }) => ({
  width: '100%',
  maxHeight: '100vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.lowGray,
  borderRadius: '16px',
  border: `1px solid ${theme.palette.app.border}`,
}));

export const PanelHeader = styled('div')(({ theme }) => ({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}));

export const ItemsList = styled('div')({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export const ItemContainer = styled('div')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px 16px'
});

export const ItemImage = styled('img')(({ theme }) => ({
  width: "32px",
  height: "32px",
  borderRadius: '8px',
  objectFit: 'cover',
  flexShrink: 0,
  backgroundColor: theme.palette.background.default,
}));

export const RemoveButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  top: 0,
  padding: 4,
  color: theme.palette.text.disabled,
  '&:hover': {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.main + '10',
  },
}));

export const StepperButton = styled(IconButton)(({ theme }) => ({
  position: "relative",
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  border: `1px solid ${theme.palette.app.border}`,
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

export const StepperInput = styled('input')(({ theme }) => ({
  width: "32px",
  height: "24px",
  textAlign: 'center',
  border: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderRadius: "4px",
  fontSize: 14,
  fontWeight: 400,
  outline: 'none',
  backgroundColor: theme.palette.background.paper,
  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
  },
  MozAppearance: 'textfield',
}));

export const ContinueButtonArea = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: 0,
  flexShrink: 0,
}));

export const ContinueButtonContent = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  '& span': {
    fontSize: 16,
    fontWeight: 600,
  },
});

export const EmptyState = styled('div')(({ theme }) => ({
  padding: '32px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: theme.palette.text.secondary,
}));
