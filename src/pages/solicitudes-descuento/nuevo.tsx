import { useEffect } from "react";
import { useRouter } from "next/router";

export default function NuevaSolicitudDescuentoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/solicitudes-descuento");
  }, [router]);

  return null;
}
