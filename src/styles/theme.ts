import { createTheme, darken, type Theme } from "@mui/material/styles";

const optionButtonBase = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  "&:hover": {
    backgroundColor: darken(theme.palette.background.paper, 0.05),
    borderColor: darken(theme.palette.app.border, 0.05),
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.action.disabled,
    borderColor: theme.palette.action.disabledBackground,
  },
});

export const SIDEBAR_WIDTH = 256;
export const CONTENT_PADDING = 32;

/** Tokens de aplicación (sidebar, chips, bordes). Expuesto en theme.palette.app */
export interface AppPalette {
  background: {
    main: string;
    sidebar: string;
    content: string;
    lowGray: string;
    lowerGray: string;
    mediumGray: string;
    lowBlue: string;
    lowerBlue: string;
    readOnlyControl: string;
  };
  border: string;
  borderLight: string;
  text: {
    primary: string;
    secondary: string;
  };
  sidebar: {
    itemSelected: string;
    textSelected: string;
  };
  chip: {
    background: string;
    border: string;
    text: string;
    variants: {
      default: { background: string; color: string };
      success: { background: string; color: string };
      pending: { background: string; color: string };
      error: { background: string; color: string };
      warning: { background: string; color: string };
      info: { background: string; color: string };
      infoAlt: { background: string; color: string };
      disabled: { background: string; color: string };
      nuevo: { background: string; color: string };
      aumento: { background: string; color: string };
    };
  };
  segmentControl: {
    background: string;
    textInactive: string;
  };
  /** Grises neutros para controles (track switch, etc.) */
  neutral: {
    switchTrack: string;
  };
  /** Banner informativo (promoción liquidación en modal de producto) */
  promotionLiquidationBanner: string;
}

export const appPalette: AppPalette = {
  background: {
    main: "#FAFAFA",
    sidebar: "#FFFFFF",
    content: "#F8FAFC",
    lowGray: "#E2E8F0",
    lowerGray: "#F1F5F9",
    mediumGray: "#CBD5E1",
    lowBlue: "#BFDBFE",
    lowerBlue: "#EFF6FF",
    readOnlyControl: "#F4F4F5",
  },
  border: "#D4D4D8",
  borderLight: "#E5E7EB",
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
      nuevo: { background: "#FAF5FF", color: "#9333EA" },
      aumento: { background: "#FDF2F8", color: "#DB2777" },
    },
  },
  segmentControl: {
    background: "#EBEBEB",
    textInactive: "#707070",
  },
  neutral: {
    switchTrack: "#E5E7EB",
  },
  promotionLiquidationBanner: "#FEE2E2",
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
      main: appPalette.sidebar.textSelected,
      light: "#5B8DEF",
      dark: "#1D4ED8",
    },
    secondary: {
      main: "#ec4899",
      light: "#f472b6",
      dark: "#db2777",
    },
    success: {
      main: "#16a34a",
      light: "#22c55e",
      dark: "#15803d",
    },
    warning: {
      main: "#ea580c",
      light: "#fb923c",
      dark: "#c2410c",
    },
    error: {
      main: appPalette.chip.variants.error.color,
      light: "#f87171",
      dark: "#b91c1c",
    },
    info: {
      main: appPalette.chip.variants.info.color,
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    background: {
      default: appPalette.background.main,
      paper: appPalette.background.sidebar,
      content: appPalette.background.content,
      lowGray: appPalette.background.lowGray,
      lowerGray: appPalette.background.lowerGray,
      mediumGray: appPalette.background.mediumGray,
      lowBlue: appPalette.background.lowBlue,
      lowerBlue: appPalette.background.lowerBlue,
    },
    text: {
      primary: appPalette.text.primary,
      secondary: appPalette.text.secondary,
    },
    divider: appPalette.border,
    app: appPalette,
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
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
      color: appPalette.text.secondary,
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
      variants: [
        {
          props: { variant: "option" },
          style: ({ theme }) => ({
            ...optionButtonBase(theme),
            color: theme.palette.text.primary,
          }),
        },
        {
          props: { variant: "option", color: "primary" },
          style: ({ theme }) => ({
            color: theme.palette.primary.main,
          }),
        },
        {
          props: { variant: "option", color: "error" },
          style: ({ theme }) => ({
            color: theme.palette.error.main,
          }),
        },
        {
          props: { variant: "option", color: "inherit" },
          style: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
        },
        {
          props: { variant: "white" },
          style: ({ theme }) => ({
            backgroundColor: '#F8FAFC',
            color: theme.palette.text.primary,
            border: 'none',
            "&:hover": {
              backgroundColor: darken('#F8FAFC', 0.05),
            },
          }),
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiInputBase-readOnly": {
            backgroundColor: appPalette.background.main,
            pointerEvents: "none",
            "& .MuiOutlinedInput-input": {
              color: theme.palette.text.primary,
              WebkitTextFillColor: theme.palette.text.primary,
            },
            "& fieldset": {
              borderColor: appPalette.border,
            },
            "&:hover fieldset": {
              borderColor: appPalette.border,
            },
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: appPalette.background.sidebar,
            "& fieldset": {
              borderColor: appPalette.border,
            },
            "&:hover fieldset": {
              borderColor: appPalette.border,
            },
            "&.Mui-focused fieldset": {
              borderColor: appPalette.sidebar.textSelected,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: appPalette.background.sidebar,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: appPalette.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: appPalette.border,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: appPalette.sidebar.textSelected,
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
          backgroundColor: appPalette.background.sidebar,
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.08)",
          "&.Mui-checked": {
            backgroundColor: appPalette.background.sidebar,
          },
        },
        track: {
          borderRadius: 12,
          backgroundColor: appPalette.neutral.switchTrack,
          opacity: 1,
          "&:after, &:before": {
            display: "none",
          },
        },
      },
      variants: [
        {
          props: { readOnly: true },
          style: {
            pointerEvents: "none",
            "& .MuiSwitch-track": {
              backgroundColor: appPalette.neutral.switchTrack,
            },
          },
        },
      ],
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
      variants: [
        {
          props: { readOnly: true },
          style: {
            pointerEvents: "none",
          },
        },
      ],
    },
  },
});

declare module "@mui/material/styles" {
  interface TypeBackground {
    content: string;
    lowGray: string;
    lowerGray: string;
    mediumGray: string;
    lowBlue: string;
    lowerBlue: string;
  }
  interface Palette {
    app: AppPalette;
  }
  interface PaletteOptions {
    app?: AppPalette;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    option: true;
    white: true;
  }
}
