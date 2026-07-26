import { useRouter } from "next/router";
import { ReceptionForm } from "@/components/ReceptionForm";

export default function NuevaRecepcion() {
  const router = useRouter();
  const supplierId = router.isReady ? Number(router.query.supplierId) : null;
  const supplierName =
    typeof router.query.supplierName === "string"
      ? router.query.supplierName
      : "";

  if (!router.isReady) {
    return null;
  }

  if (supplierId == null || Number.isNaN(supplierId)) {
    return null;
  }

  return (
    <ReceptionForm
      mode="create"
      supplierId={supplierId}
      supplierName={supplierName}
    />
  );
}
