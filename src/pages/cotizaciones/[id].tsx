import { useRouter } from "next/router";
import { SaleBuilder } from "@/components/SaleBuilder";

export default function CotizacionDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const resumeSaleId = typeof id === "string" ? Number(id) : null;

  return (
    <SaleBuilder
      resumeSaleId={resumeSaleId}
      onExit={() => void router.push("/cotizaciones-guardadas")}
    />
  );
}
