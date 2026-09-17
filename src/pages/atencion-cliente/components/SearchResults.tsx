import { Skeleton, Typography } from "@mui/material";
import { ChevronRight, FileText, SearchX, User } from "lucide-react";
import numeral from "numeral";
import { StatusChip } from "@/components";
import { paymentTypeLabel } from "@/types/atencion-cliente.types";
import type { CustomerSupportSearchResult } from "@/services/customer-support.service";
import type { SalePaymentType } from "@/types/ventas.types";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";
import {
  SearchEmptyState,
  SearchResultAside,
  SearchResultBody,
  SearchResultCard,
  SearchResultIcon,
  SearchResultMeta,
  SearchResultsHeader,
  SearchResultsList,
} from "@/styles/atencion-cliente.styles";

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function salePaymentLabel(type: SalePaymentType): string {
  return paymentTypeLabel(
    type === "CREDIT" ? "credito" : type === "LAYAWAY" ? "apartado" : "contado",
  );
}

export interface SearchResultsProps {
  results: CustomerSupportSearchResult[];
  loading: boolean;
  hint?: string | null;
  onSelect: (result: CustomerSupportSearchResult) => void;
}

export function SearchResults({
  results,
  loading,
  hint,
  onSelect,
}: SearchResultsProps) {
  if (loading) {
    return (
      <SearchResultsList>
        {[0, 1, 2].map((key) => (
          <Skeleton
            key={key}
            variant="rounded"
            height={88}
            sx={{ borderRadius: 4 }}
          />
        ))}
      </SearchResultsList>
    );
  }

  if (results.length === 0) {
    return (
      <SearchResultsList>
        <SearchEmptyState>
          <SearchX size={28} />
          <Typography fontWeight={600} color="text.primary">
            No encontramos coincidencias
          </Typography>
          <Typography variant="body2">
            Prueba con el folio de la factura, el nombre del cliente o un
            teléfono.
          </Typography>
        </SearchEmptyState>
      </SearchResultsList>
    );
  }

  const noun = results[0]?.type === "clientes" ? "cliente" : "factura";
  const countLabel =
    results.length === 1 ? `1 ${noun}` : `${results.length} ${noun}s`;

  return (
    <SearchResultsList>
      <SearchResultsHeader>
        <Typography variant="body2" color="text.secondary">
          {hint ?? countLabel}
        </Typography>
        {hint ? (
          <Typography variant="body2" color="text.secondary">
            {countLabel}
          </Typography>
        ) : null}
      </SearchResultsHeader>
      {results.map((result) => (
        <SearchResultCard
          key={`${result.type}-${result.id}`}
          role="button"
          tabIndex={0}
          aria-label={
            result.type === "clientes"
              ? `${result.title}. Ver facturas`
              : `${result.title}. ${result.subtitle ?? ""}`
          }
          onClick={() => onSelect(result)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(result);
            }
          }}
        >
          <SearchResultIcon>
            {result.type === "clientes" ? (
              <User size={18} />
            ) : (
              <FileText size={18} />
            )}
          </SearchResultIcon>
          <SearchResultBody>
            <Typography fontWeight={700} noWrap>
              {result.title}
            </Typography>
            {result.subtitle ? (
              <Typography variant="body2" color="text.secondary" noWrap>
                {result.subtitle}
              </Typography>
            ) : null}
            <SearchResultMeta>
              {result.status ? (
                <StatusChip
                  size="small"
                  label={SALE_STATUS_CHIP_LABELS[result.status]}
                  variant={SALE_STATUS_CHIP_VARIANTS[result.status]}
                />
              ) : null}
              {result.paymentType ? (
                <Typography variant="caption" color="text.secondary">
                  {salePaymentLabel(result.paymentType)}
                </Typography>
              ) : null}
              {result.dateLabel ? (
                <Typography variant="caption" color="text.secondary">
                  {result.dateLabel}
                </Typography>
              ) : null}
            </SearchResultMeta>
          </SearchResultBody>
          <SearchResultAside>
            {result.amount != null ? (
              <Typography fontWeight={700} color="text.primary">
                {formatCurrency(result.amount)}
              </Typography>
            ) : result.type === "clientes" ? (
              <Typography variant="caption" color="text.secondary">
                Ver facturas
              </Typography>
            ) : null}
            <ChevronRight size={18} />
          </SearchResultAside>
        </SearchResultCard>
      ))}
    </SearchResultsList>
  );
}

const SearchResultsPage = () => null;

export default SearchResultsPage;
