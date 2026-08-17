import { StyledTablePagination } from "@/components/TableCrud/styles";

export interface CardListPaginationProps {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  rowsPerPage?: number;
}

export function CardListPagination({
  page,
  total,
  onPageChange,
  rowsPerPage = 10,
}: CardListPaginationProps) {
  if (total === 0) return null;

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
