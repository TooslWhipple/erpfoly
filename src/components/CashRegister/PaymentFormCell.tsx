import { Typography } from "@mui/material";
import {
  getPaymentFormLabel,
  type CashMovementPaymentForm,
} from "@/lib/cashMovement.constants";

interface PaymentFormCellProps {
  paymentForm?: CashMovementPaymentForm | null;
}

export function PaymentFormCell({ paymentForm }: PaymentFormCellProps) {
  return (
    <Typography variant="body2">
      {getPaymentFormLabel(paymentForm)}
    </Typography>
  );
}
