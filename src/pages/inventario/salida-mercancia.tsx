import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Legacy route: devoluciones a proveedor viven en /inventario/devoluciones-proveedor.
 */
export default function SalidaMercanciaRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/inventario/devoluciones-proveedor");
  }, [router]);

  return null;
}
