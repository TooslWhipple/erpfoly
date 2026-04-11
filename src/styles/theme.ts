import { createTheme } from "@mui/material/styles";

export const SIDEBAR_WIDTH = 240;
export const CONTENT_PADDING = 32;

export const colors = {
  background: {
    main: "#FAFAFA",
    sidebar: "#FFFFFF",
    content: "#F8FAFC",
  },
  border: "#D4D4D8",
  text: {
    primary: "#232325",
    secondary: "#71717A",
  },
  sidebar: {
    itemSelected: "#F0F6FF",
    textSelected: "#2663EB",
  },
  chip: {
    background: "#F1F5F9",
    border: "#F9FAFC",
    text: "#475569",
    variants: {
      default: { background: "#F8FAFC", color: "#475569" },
      success: { background: "#DCFCE7", color: "#15803D" },
      pending: { background: "#FFF7ED", color: "#EA580C" },
      error: { background: "#FEF2F2", color: "#DC2626" },
      warning: { background: "#F3E8FF", color: "#7E22CE" },
      info: { background: "#DBEAFE", color: "#2563EB" },
      infoAlt: { background: "#FEF3C7", color: "#D97706" },
      disabled: { background: "#E2E8F0", color: "#475569" },
    },
  },
  segmentControl: {
    background: "#EBEBEB",
    textInactive: "#707070",
  },
};

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#2663EB",
      light: "#5B8DEF",
      dark: "#1D4ED8",
    },
    secondary: {
      main: "#ec4899",
      light: "#f472b6",
      dark: "#db2777",
    },
    background: {
      default: colors.background.main,
      paper: colors.background.sidebar,
      content: colors.background.content,
    },
    text: {
      primary: "#232325",
      secondary: "#71717A",
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    h1: {
      fontSize: 32,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.5,
      color: "#71717A",
    },
    overline: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    button: {
      fontSize: 14,
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          minHeight: 36,
          height: 36,
          maxHeight: 36,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
          "&:active": {
            boxShadow: "none",
          },
          "&:focus": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: colors.background.sidebar,
            "& fieldset": {
              borderColor: colors.border,
            },
            "&:hover fieldset": {
              borderColor: colors.border,
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2663EB",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.sidebar,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2663EB",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          height: 36,
          padding: "8px 12px",
          borderRadius: 6,
          marginBottom: 4,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 24,
          padding: 0,
        },
        switchBase: ({ theme }) => ({
          padding: 2,
          "&.Mui-checked": {
            transform: "translateX(20px)",
            "& + .MuiSwitch-track": {
              backgroundColor: theme.palette.primary.main,
              opacity: 1,
            },
            "& .MuiSwitch-thumb": {
              boxShadow: "none",
              border: "none",
            },
          },
        }),
        thumb: {
          width: 20,
          height: 20,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.08)",
          "&.Mui-checked": {
            backgroundColor: "#FFFFFF",
          },
        },
        track: {
          borderRadius: 12,
          backgroundColor: "#E5E7EB",
          opacity: 1,
          "&:after, &:before": {
            display: "none",
          },
        },
      },
    },
  },
});

declare module "@mui/material/styles" {
  interface TypeBackground {
    content: string;
  }
}
