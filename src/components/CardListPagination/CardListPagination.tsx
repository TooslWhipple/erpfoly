import { IconButton, Stack, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StyledTablePagination } from "@/components/TableCrud/styles";

export interface CardListPaginationProps {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  rowsPerPage?: number;
  /** Table footer for wide lists. Compact is a single row for sidebars and card grids. */
  variant?: "table" | "compact";
  disabled?: boolean;
}

export function CardListPagination({
  page,
  total,
  onPageChange,
  rowsPerPage = 10,
  variant = "table",
  disabled = false,
}: CardListPaginationProps) {
  if (total === 0) return null;

  if (variant === "compact") {
    const lastPage = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
    const safePage = Math.min(Math.max(page, 0), lastPage);
    const from = safePage * rowsPerPage + 1;
    const to = Math.min(total, (safePage + 1) * rowsPerPage);

    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ borderTop: 1, borderColor: "divider", pt: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {from}–{to} de {total}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="Página anterior"
            disabled={disabled || safePage <= 0}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Página siguiente"
            disabled={disabled || safePage >= lastPage}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight size={18} />
          </IconButton>
        </Stack>
      </Stack>
    );
  }

  return (
    <StyledTablePagination
      slots={{ root: "div" }}
      rowsPerPageOptions={[]}
      count={total}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      labelRowsPerPage="Filas por página:"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
      }
    />
  );
}
