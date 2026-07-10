import { Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { getFirstAllowedRoute } from "@/lib/routeAccess";
import { useAuthStore } from "@/store/useAuthStore";
import { ForbiddenContent } from "@/styles/forbidden.styles";
export default function ForbiddenPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const handleGoHome = () => {
    void router.push(getFirstAllowedRoute(user));
  };
  return (
    <ForbiddenContent spacing={2}>
      <Typography variant="h4">No tienes acceso a esta pantalla</Typography>
      <Typography variant="body1" color="text.secondary">
        Tu rol no cuenta con los permisos necesarios para continuar.
      </Typography>
      <Button variant="contained" onClick={handleGoHome}>
        Ir a mi inicio
      </Button>
    </ForbiddenContent>
  );
}
