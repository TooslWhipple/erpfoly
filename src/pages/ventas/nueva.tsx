import { useRouter } from "next/router";
import { SaleBuilder } from "@/components/SaleBuilder";

export default function NuevaVenta() {
  const router = useRouter();
  const resumeSaleId =
    router.isReady && router.query.resumeSaleId
      ? Number(router.query.resumeSaleId)
      : null;

  return (
    <SaleBuilder
      resumeSaleId={resumeSaleId}
      resumeRoutePending={!router.isReady}
      onExit={() => void router.push("/ventas")}
      mode="vendedor"
    />
  );
}
