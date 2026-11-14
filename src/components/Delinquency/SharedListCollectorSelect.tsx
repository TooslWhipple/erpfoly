"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSelect } from "@/components/Form";
import { unwrapOrThrow } from "@/lib/axios";
import { getSharedListCollectors } from "@/services/delinquency-shared-list.service";

export interface SharedListCollectorSelectProps {
  open: boolean;
  value: number | "";
  onChange: (collectorUserId: number) => void;
  disabled?: boolean;
}

export function SharedListCollectorSelect({
  open,
  value,
  onChange,
  disabled = false,
}: SharedListCollectorSelectProps) {
  const { data: collectors, isLoading } = useQuery({
    queryKey: ["clients", "delinquency", "shared-list-collectors"],
    queryFn: async () => unwrapOrThrow(await getSharedListCollectors()),
    enabled: open,
  });

  const options = useMemo(
    () =>
      (collectors ?? []).map((collector) => ({
        value: collector.id,
        label: `${collector.fullName} (${collector.username})`,
      })),
    [collectors],
  );

  const hasNoCollectors = collectors != null && collectors.length === 0;

  return (
    <FormSelect
      label="Gestor"
      required
      placeholder="Selecciona un gestor"
      value={value}
      options={options}
      onChange={(event) => onChange(Number(event.target.value))}
      disabled={disabled || isLoading || hasNoCollectors}
      helperText={
        hasNoCollectors
          ? "No hay gestores de Cobranza externa activos. Créalos en Catálogos › Usuarios."
          : undefined
      }
    />
  );
}
