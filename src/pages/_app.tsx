import type { AppProps } from "next/app";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthGuard, GlobalSnackbar } from "@/components";
import { AppLayoutGate } from "@/components/Layout";
import "@/lib/dayjs";
import { theme } from "@/styles/theme";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es-mx">
          <CssBaseline />
          <AuthGuard>
            <AppLayoutGate>
              <Component {...pageProps} />
            </AppLayoutGate>
          </AuthGuard>
          <GlobalSnackbar />
        </LocalizationProvider>
      </ThemeProvider>

      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
