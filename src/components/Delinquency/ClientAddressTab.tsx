import { Typography } from "@mui/material";
import { AddressSection } from "@/components/CreditApplicationDetailSections/AddressSection";
import { toCreditApplicationDetailForAddress } from "@/lib/delinquencyClientInfoMapper";
import type { SharedDelinquencyAddress } from "@/types/delinquency-shared-list.types";

export interface ClientAddressTabProps {
  address: SharedDelinquencyAddress | null;
}

export function ClientAddressTab({ address }: ClientAddressTabProps) {
  if (!address) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay dirección registrada
      </Typography>
    );
  }

  return (
    <AddressSection detail={toCreditApplicationDetailForAddress(address)} />
  );
}
