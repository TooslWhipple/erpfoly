import { useRouter } from "next/router";
import OrderForm from "@/components/OrderForm";

export default function EditarPedido() {
    const router = useRouter();
    const { id } = router.query;

    const orderId = id && typeof id === "string" ? Number(id) : undefined;

    if (!orderId) {
        return null;
    }

    return <OrderForm mode="edit" orderId={orderId} />;
}
