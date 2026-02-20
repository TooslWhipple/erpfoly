import { Alert, Snackbar } from "@mui/material";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const AUTO_HIDE_DURATION = 6000;

export function GlobalSnackbar() {
  const { open, message, severity, close } = useSnackbarStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={close}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={close} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
