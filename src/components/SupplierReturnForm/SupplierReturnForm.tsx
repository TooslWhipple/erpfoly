"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/router";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TableBody,
  TextField,
  Typography,
  useTheme,
  type AutocompleteInputChangeReason,
} from "@mui/material";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components";
import { FormTextField } from "@/components/Form";
import { NumberInput } from "@/components/Folypuntos";
import { TabFilters, type TabOption } from "@/components/TabFilters";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getDamagedProduct,
  getDamagedProducts,
  getDamagedProductBranchesWithStock,
  PRODUCT_SEARCH_DEFAULT_LIMIT,
  searchProducts,
  type DamagedProductListItem,
  type ProductSearchItem,
} from "@/services/damaged-products.service";
import { getProductById } from "@/services/productos.service";
import {
  createSupplierReturn,
  type SupplierReturnItemPayload,
  type SupplierReturnReason,
} from "@/services/supplier-returns.service";
import {
  getSuppliersCatalog,
  type SupplierCatalogItem,
} from "@/services/suppliers.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  PageContainer,
  PageHeader,
  HeaderActions,
  ActionButton,
  ContentLayout,
  TableContainer,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  Table,
} from "@/styles/recepcion-mercancias/index.styles";
import {
  FormSection,
  SectionTitle,
  ReadOnlyField,
  ReadOnlyLabel,
  ReadOnlyValue,
  ReadOnlyFieldsRow,
  RowActionsCell,
  RemoveRowButton,
  AddRowContainer,
  ErrorText,
  ReasonFieldsRow,
} from "@/styles/supplier-returns/index.styles";

const SEARCH_DEBOUNCE_MS = 300;
const MERCANCIA_DANADA_PATH = "/inventario/mercancia-danada";

const MODE_TABS: TabOption[] = [
  { label: "Con folio", value: "folio" },
  { label: "Libre", value: "libre" },
];

const REASON_OPTIONS: Array<{ value: SupplierReturnReason; label: string }> = [
  { value: "damaged_goods", label: "Mercancía dañada" },
  { value: "overstock", label: "Sobrestock" },
  { value: "other", label: "Otro" },
];

let freeRowSeq = 0;
function nextFreeRowId(): string {
  freeRowSeq += 1;
  return `row-${freeRowSeq}`;
}

interface FreeModeRow {
  rowId: string;
  productId: number;
  productLabel: string;
  branchId: number;
  branchLabel: string;
  quantity: number;
}

function createEmptyRow(): FreeModeRow {
  return {
    rowId: nextFreeRowId(),
    productId: 0,
    productLabel: "",
    branchId: 0,
    branchLabel: "",
    quantity: 1,
  };
}

export interface SupplierReturnFormProps {
  /** No-op today; reserved so tests/stories can inject a different redirect target. */
  onSubmitted?: () => void;
}

export function SupplierReturnForm({ onSubmitted }: SupplierReturnFormProps = {}) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbarStore();

  const [mode, setMode] = useState<string>("folio");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---- Modo "Con folio" ------------------------------------------------
  const [folioInputValue, setFolioInputValue] = useState("");
  const [selectedFolioSummary, setSelectedFolioSummary] =
    useState<DamagedProductListItem | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );

  const debouncedFolioQuery = useDebouncedValue(folioInputValue.trim(), SEARCH_DEBOUNCE_MS);

  const folioSearchQuery = useQuery({
    queryKey: ["damaged-products", "supplier-return-search", debouncedFolioQuery],
    queryFn: async () => {
      const result = await getDamagedProducts({
        page: 1,
        limit: 20,
        search: debouncedFolioQuery || undefined,
      });
      if (result.error != null) {
        throw new Error(result.error.message);
      }
      return result.data?.rows ?? [];
    },
    staleTime: 15_000,
    // Once a folio is selected, `folioInputValue` gets set to its full label
    // (`Folio #123 — Producto`) just to display it; that text must never be
    // sent as `search`, so the query stops instead of re-firing with it.
    enabled: selectedFolioSummary == null,
  });

  const folioOptions = useMemo(
    () =>
      (folioSearchQuery.data ?? []).filter(
        (row) =>
          row.dispositionCode === "RETURN_TO_SUPPLIER" &&
          row.discountStatus !== "collected",
      ),
    [folioSearchQuery.data],
  );

  const folioId = selectedFolioSummary?.id ?? 0;

  const folioDetailQuery = useQuery({
    queryKey: ["damaged-products", "detail", folioId],
    queryFn: async () => {
      const result = await getDamagedProduct(folioId);
      if (result.error != null) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: folioId > 0,
    staleTime: 15_000,
  });

  const folioDetail = folioDetailQuery.data ?? null;
  const folioProductId = folioDetail?.productId ?? 0;

  const folioSuppliersQuery = useQuery({
    queryKey: ["products", "detail", folioProductId],
    queryFn: async () => {
      const result = await getProductById(folioProductId);
      if (result.error != null) {
        throw new Error(result.error.message);
      }
      return result.data?.suppliers ?? [];
    },
    enabled: folioProductId > 0,
    staleTime: 30_000,
  });

  // Reset a manual supplier choice whenever the underlying folio's product
  // changes, without a synchronous setState-in-effect: adjust the state
  // during render instead (React's documented pattern for "reset state when
  // a prop/derived value changes").
  const [prevFolioProductId, setPrevFolioProductId] = useState(folioProductId);
  if (folioProductId !== prevFolioProductId) {
    setPrevFolioProductId(folioProductId);
    setSelectedSupplierId(null);
  }

  const folioSuppliers = folioSuppliersQuery.data ?? [];
  const folioSuppliersLoaded =
    folioProductId > 0 &&
    folioSuppliersQuery.isSuccess &&
    !folioSuppliersQuery.isFetching;
  const folioHasNoSuppliers = folioSuppliersLoaded && folioSuppliers.length === 0;

  const folioResolvedSupplierId =
    folioSuppliers.length === 1 ? folioSuppliers[0].supplierId : selectedSupplierId;

  const canSubmitFolio =
    !submitting &&
    folioDetail != null &&
    folioResolvedSupplierId != null &&
    folioResolvedSupplierId > 0;

  // ---- Modo "Libre" ------------------------------------------------------
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierCatalogItem | null>(null);
  const [reason, setReason] = useState<SupplierReturnReason | "">("");
  const [rows, setRows] = useState<FreeModeRow[]>([createEmptyRow()]);

  const suppliersCatalogQuery = useQuery({
    queryKey: ["suppliers", "catalog"],
    queryFn: () => getSuppliersCatalog(),
    staleTime: 5 * 60_000,
    enabled: mode === "libre",
  });

  function updateRow(rowId: string, patch: Partial<FreeModeRow>) {
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
  }

  function handleAddRow() {
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  function handleRemoveRow(rowId: string) {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.rowId !== rowId),
    );
  }

  const rowsValid =
    rows.length > 0 &&
    rows.every((row) => row.productId > 0 && row.branchId > 0 && row.quantity >= 1);

  const canSubmitLibre =
    !submitting && selectedSupplier != null && reason !== "" && rowsValid;

  async function handleSubmitFolio() {
    if (folioDetail == null || folioResolvedSupplierId == null) {
      return;
    }
    setSubmitting(true);
    const result = await createSupplierReturn({
      supplierId: folioResolvedSupplierId,
      damagedProductId: folioDetail.id,
      items: [
        {
          productId: folioDetail.productId,
          branchId: folioDetail.branchId,
          quantity: folioDetail.quantity,
        },
      ],
      reason: "damaged_goods",
      notes: notes.trim() === "" ? undefined : notes,
    });
    setSubmitting(false);

    if (result.error != null) {
      showError(result.error.message);
      return;
    }
    showSuccess("Salida a proveedor registrada.");
    onSubmitted?.();
    void router.push(MERCANCIA_DANADA_PATH);
  }

  async function handleSubmitLibre() {
    if (selectedSupplier == null || reason === "" || !rowsValid) {
      return;
    }
    const items: SupplierReturnItemPayload[] = rows.map((row) => ({
      productId: row.productId,
      branchId: row.branchId,
      quantity: row.quantity,
    }));
    setSubmitting(true);
    const result = await createSupplierReturn({
      supplierId: selectedSupplier.id,
      items,
      reason,
      notes: notes.trim() === "" ? undefined : notes,
    });
    setSubmitting(false);

    if (result.error != null) {
      showError(result.error.message);
      return;
    }
    showSuccess("Salida a proveedor registrada.");
    onSubmitted?.();
    void router.push(MERCANCIA_DANADA_PATH);
  }

  const isFolioMode = mode === "folio";

  return (
    <PageContainer>
      <PageHeader>
        <Breadcrumbs
          items={[
            { label: "Mercancía dañada", href: MERCANCIA_DANADA_PATH },
            { label: "Salida a proveedor" },
          ]}
        />
        <HeaderActions>
          <ActionButton
            variant="contained"
            color="primary"
            onClick={isFolioMode ? handleSubmitFolio : handleSubmitLibre}
            disabled={isFolioMode ? !canSubmitFolio : !canSubmitLibre}
          >
            Registrar salida
          </ActionButton>
        </HeaderActions>
      </PageHeader>

      <TabFilters tabs={MODE_TABS} activeTab={mode} onTabChange={setMode} />

      <ContentLayout>
        <Stack spacing={3} flex="1 1 0">
          {isFolioMode ? (
            <FormSection>
              <SectionTitle>Folio de mercancía dañada</SectionTitle>
              <FolioSearchField
                inputValue={folioInputValue}
                onInputValueChange={setFolioInputValue}
                options={folioOptions}
                isFetching={folioSearchQuery.isFetching}
                value={selectedFolioSummary}
                onChange={setSelectedFolioSummary}
              />

              {folioDetailQuery.isFetching ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando folio...
                </Typography>
              ) : folioDetail != null ? (
                <ReadOnlyFieldsRow>
                  <ReadOnlyField>
                    <ReadOnlyLabel>Producto</ReadOnlyLabel>
                    <ReadOnlyValue>
                      {folioDetail.product.code} — {folioDetail.product.name}
                    </ReadOnlyValue>
                  </ReadOnlyField>
                  <ReadOnlyField>
                    <ReadOnlyLabel>Sucursal</ReadOnlyLabel>
                    <ReadOnlyValue>{folioDetail.branch.name}</ReadOnlyValue>
                  </ReadOnlyField>
                  <ReadOnlyField>
                    <ReadOnlyLabel>Cantidad</ReadOnlyLabel>
                    <ReadOnlyValue>{folioDetail.quantity}</ReadOnlyValue>
                  </ReadOnlyField>
                </ReadOnlyFieldsRow>
              ) : null}

              {folioDetail != null && (
                <ReadOnlyField>
                  <ReadOnlyLabel>Proveedor</ReadOnlyLabel>
                  {folioSuppliersQuery.isFetching ? (
                    <Typography variant="body2" color="text.secondary">
                      Cargando proveedores...
                    </Typography>
                  ) : folioSuppliers.length === 1 ? (
                    <ReadOnlyValue>
                      {folioSuppliers[0].supplierName ??
                        `Proveedor ${folioSuppliers[0].supplierId}`}
                    </ReadOnlyValue>
                  ) : folioSuppliers.length > 1 ? (
                    <FormControl size="small" sx={{ minWidth: 240 }}>
                      <Select
                        displayEmpty
                        value={
                          selectedSupplierId != null ? String(selectedSupplierId) : ""
                        }
                        onChange={(event) => {
                          const raw = event.target.value;
                          setSelectedSupplierId(raw === "" ? null : Number(raw));
                        }}
                      >
                        <MenuItem value="">
                          <em>Seleccione proveedor</em>
                        </MenuItem>
                        {folioSuppliers.map((supplier) => (
                          <MenuItem
                            key={supplier.supplierId}
                            value={String(supplier.supplierId)}
                          >
                            {supplier.supplierName ??
                              `Proveedor ${supplier.supplierId}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : folioHasNoSuppliers ? (
                    <ErrorText>
                      El artículo no tiene proveedores registrados.
                    </ErrorText>
                  ) : null}
                </ReadOnlyField>
              )}
            </FormSection>
          ) : (
            <FormSection>
              <SectionTitle>Proveedor</SectionTitle>
              <Autocomplete<SupplierCatalogItem, false, false, false>
                fullWidth
                options={suppliersCatalogQuery.data ?? []}
                loading={suppliersCatalogQuery.isFetching}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selectedSupplier}
                onChange={(_, newValue) => setSelectedSupplier(newValue)}
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor" placeholder="Seleccione" />
                )}
              />

              <FormControl>
                <FormLabel>Motivo</FormLabel>
                <RadioGroup
                  row
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value as SupplierReturnReason)
                  }
                >
                  <ReasonFieldsRow>
                    {REASON_OPTIONS.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                      />
                    ))}
                  </ReasonFieldsRow>
                </RadioGroup>
              </FormControl>

              <TableContainer>
                <Table>
                  <StyledTableHead>
                    <StyledTableRow>
                      <StyledTableCell>Producto</StyledTableCell>
                      <StyledTableCell>Sucursal</StyledTableCell>
                      <StyledTableCell>Cantidad</StyledTableCell>
                      <StyledTableCell align="center">Quitar</StyledTableCell>
                    </StyledTableRow>
                  </StyledTableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <StyledTableRow key={row.rowId}>
                        <StyledTableCell sx={{ minWidth: 240 }}>
                          <FreeModeProductField
                            value={row.productId}
                            onChange={(productId, productLabel) =>
                              updateRow(row.rowId, {
                                productId,
                                productLabel,
                                branchId: 0,
                                branchLabel: "",
                              })
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 200 }}>
                          <FreeModeBranchField
                            productId={row.productId}
                            value={row.branchId}
                            onChange={(branchId, branchLabel) =>
                              updateRow(row.rowId, { branchId, branchLabel })
                            }
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <NumberInput
                            value={row.quantity}
                            onChange={(value) =>
                              updateRow(row.rowId, { quantity: value })
                            }
                            min={1}
                            max={999999}
                            width={80}
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <RowActionsCell>
                            <RemoveRowButton
                              size="small"
                              onClick={() => handleRemoveRow(row.rowId)}
                              disabled={rows.length <= 1}
                            >
                              <Trash2 size={16} />
                            </RemoveRowButton>
                          </RowActionsCell>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <AddRowContainer>
                <ActionButton
                  variant="outlined"
                  color="primary"
                  onClick={handleAddRow}
                  startIcon={<Plus size={18} />}
                >
                  Agregar artículo
                </ActionButton>
              </AddRowContainer>
            </FormSection>
          )}
        </Stack>

        <Stack spacing={2} flex="0 1 320px">
          <FormSection>
            <SectionTitle>Notas</SectionTitle>
            <TextField
              multiline
              minRows={4}
              fullWidth
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notas (opcional)"
              inputProps={{ maxLength: 512 }}
              helperText={`${notes.length}/512`}
            />
          </FormSection>
        </Stack>
      </ContentLayout>
    </PageContainer>
  );
}

// ---------------------------------------------------------------------------
// Modo "Con folio": buscador de folios
// ---------------------------------------------------------------------------

interface FolioSearchFieldProps {
  inputValue: string;
  onInputValueChange: (value: string) => void;
  options: DamagedProductListItem[];
  isFetching: boolean;
  value: DamagedProductListItem | null;
  onChange: (value: DamagedProductListItem | null) => void;
}

function FolioSearchField({
  inputValue,
  onInputValueChange,
  options,
  isFetching,
  value,
  onChange,
}: FolioSearchFieldProps) {
  const theme = useTheme();

  const handleInputChange = (
    _: SyntheticEvent,
    newInputValue: string,
    reason: AutocompleteInputChangeReason,
  ) => {
    if (reason === "clear") {
      onInputValueChange("");
      onChange(null);
      return;
    }
    if (reason === "reset") {
      return;
    }
    onInputValueChange(newInputValue);
  };

  const endAdornment = (
    <>
      {isFetching ? (
        <CircularProgress color="inherit" size={18} sx={{ mr: 0.5 }} />
      ) : null}
      <InputAdornment position="end">
        <Search size={18} color={theme.palette.text.secondary} />
      </InputAdornment>
    </>
  );

  return (
    <Autocomplete<DamagedProductListItem, false, false, false>
      fullWidth
      options={options}
      loading={isFetching}
      filterOptions={(list) => list}
      getOptionLabel={(option) => `Folio #${option.id} — ${option.productName}`}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      value={value}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, newValue) => {
        onChange(newValue);
        onInputValueChange(
          newValue == null ? "" : `Folio #${newValue.id} — ${newValue.productName}`,
        );
      }}
      noOptionsText="Sin resultados"
      renderInput={(params: AutocompleteRenderInputParams) => {
        const { InputProps, ...rest } = params;
        return (
          <FormTextField
            {...rest}
            label="Folio"
            placeholder="Buscar folio"
            InputProps={{
              ...InputProps,
              endAdornment: (
                <>
                  {InputProps.endAdornment}
                  {endAdornment}
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Modo "Libre": búsqueda de producto y sucursal por fila
// ---------------------------------------------------------------------------

interface FreeModeProductFieldProps {
  value: number;
  onChange: (productId: number, productLabel: string) => void;
  disabled?: boolean;
}

function FreeModeProductField({
  value,
  onChange,
  disabled = false,
}: FreeModeProductFieldProps) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState("");
  const [committedSelection, setCommittedSelection] =
    useState<ProductSearchItem | null>(null);

  const debouncedQ = useDebouncedValue(inputValue.trim(), SEARCH_DEBOUNCE_MS);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["products-search", debouncedQ, PRODUCT_SEARCH_DEFAULT_LIMIT],
    queryFn: async () => {
      const result = await searchProducts({ q: debouncedQ, limit: PRODUCT_SEARCH_DEFAULT_LIMIT });
      if (result.error != null) {
        throw new Error(result.error.message);
      }
      return result.data ?? [];
    },
  });

  // Adjust local state during render when the row's productId is cleared
  // externally (e.g. removed row reset), instead of a setState-in-effect.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value === 0) {
      setCommittedSelection(null);
      setInputValue("");
    }
  }

  const getLabel = (option: ProductSearchItem) => `${option.code} · ${option.shortName}`;

  const handleInputChange = (
    _: SyntheticEvent,
    newValue: string,
    reason: AutocompleteInputChangeReason,
  ) => {
    if (reason === "clear") {
      setInputValue("");
      setCommittedSelection(null);
      onChange(0, "");
      return;
    }
    if (reason === "reset") {
      return;
    }
    setInputValue(newValue);
    if (committedSelection != null && newValue !== getLabel(committedSelection)) {
      setCommittedSelection(null);
      onChange(0, "");
    }
  };

  const endAdornment = (
    <>
      {isFetching ? (
        <CircularProgress color="inherit" size={18} sx={{ mr: 0.5 }} />
      ) : null}
      <InputAdornment position="end">
        <Search size={18} color={theme.palette.text.secondary} />
      </InputAdornment>
    </>
  );

  return (
    <Autocomplete<ProductSearchItem, false, false, false>
      fullWidth
      disabled={disabled}
      options={options}
      loading={isFetching}
      filterOptions={(list) => list}
      getOptionLabel={getLabel}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      value={committedSelection}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={(_, newValue) => {
        if (newValue == null) {
          setCommittedSelection(null);
          setInputValue("");
          onChange(0, "");
        } else {
          setCommittedSelection(newValue);
          setInputValue(getLabel(newValue));
          onChange(newValue.id, getLabel(newValue));
        }
      }}
      noOptionsText="Sin resultados"
      renderInput={(params: AutocompleteRenderInputParams) => {
        const { InputProps, ...rest } = params;
        return (
          <FormTextField
            {...rest}
            placeholder="Buscar producto"
            InputProps={{
              ...InputProps,
              endAdornment: (
                <>
                  {InputProps.endAdornment}
                  {endAdornment}
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}

interface FreeModeBranchFieldProps {
  productId: number;
  value: number;
  onChange: (branchId: number, branchLabel: string) => void;
  disabled?: boolean;
}

function FreeModeBranchField({
  productId,
  value,
  onChange,
  disabled = false,
}: FreeModeBranchFieldProps) {
  const branchesQuery = useQuery({
    queryKey: ["damaged-products", "branches-with-stock", productId],
    queryFn: async () => {
      const result = await getDamagedProductBranchesWithStock(productId);
      if (result.error != null) {
        throw new Error(result.error.message);
      }
      return result.data ?? [];
    },
    enabled: productId > 0,
    staleTime: 30_000,
  });

  const branchOptions = branchesQuery.data ?? [];

  useEffect(() => {
    if (productId <= 0 || branchesQuery.isFetching) {
      return;
    }
    if (!branchesQuery.isSuccess || branchesQuery.data == null) {
      return;
    }
    if (branchesQuery.data.length === 1 && value !== branchesQuery.data[0].id) {
      onChange(branchesQuery.data[0].id, branchesQuery.data[0].label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, branchesQuery.isFetching, branchesQuery.isSuccess, branchesQuery.data]);

  const hasProduct = productId > 0;
  const isLoading = hasProduct && branchesQuery.isFetching;
  const noStock =
    hasProduct &&
    branchesQuery.isSuccess &&
    !branchesQuery.isFetching &&
    branchOptions.length === 0;

  let placeholderLabel = "Seleccione";
  if (!hasProduct) {
    placeholderLabel = "Seleccione un producto";
  } else if (isLoading) {
    placeholderLabel = "Cargando...";
  } else if (noStock) {
    placeholderLabel = "Sin existencia";
  }

  return (
    <FormControl size="small" fullWidth disabled={disabled || !hasProduct || isLoading || noStock}>
      <Select
        displayEmpty
        value={value > 0 ? String(value) : ""}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(0, "");
            return;
          }
          const id = Number(raw);
          const option = branchOptions.find((item) => item.id === id);
          onChange(id, option?.label ?? "");
        }}
      >
        <MenuItem value="">
          <em>{placeholderLabel}</em>
        </MenuItem>
        {branchOptions.map((option) => (
          <MenuItem key={option.id} value={String(option.id)}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
