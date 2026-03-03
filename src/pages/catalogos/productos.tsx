import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { MainLayout, Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { HeaderContainer } from "@/styles/catalogos/catalogos.styledComponents";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ProductStatus = "active" | "draft";

interface Product {
  id: string;
  code: string;
  name: string;
  status: ProductStatus;
  department: {
    id: number;
    code: string;
    name: string;
  };
  line: {
    code: string;
    name: string;
  };
  supplier: {
    id: number;
    name: string;
  };
}

interface GetProductsParams {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus | "all";
}

interface GetProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// MOCK DATA - Realistic e-commerce products
// ============================================================================

const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    code: "ART-001",
    name: "Sofá Cama Gris Venecia",
    status: "active",
    department: { id: 3, code: "02", name: "Muebles" },
    line: { code: "SL", name: "Sala" },
    supplier: { id: 1, name: "Muebles América" },
  },
  {
    id: "2",
    code: "ART-002",
    name: "Refrigerador Samsung 19kg",
    status: "active",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "RF", name: "Refrigerador" },
    supplier: { id: 2, name: "Samsung Electronics" },
  },
  {
    id: "3",
    code: "ART-003",
    name: "Lavadora Mabe 19kg 121345",
    status: "active",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "LV", name: "Lavadora" },
    supplier: { id: 3, name: "Mabe S.A de C.V" },
  },
  {
    id: "4",
    code: "ART-004",
    name: "Comedor de Madera 6 Personas",
    status: "active",
    department: { id: 3, code: "02", name: "Muebles" },
    line: { code: "CM", name: "Comedor" },
    supplier: { id: 4, name: "Muebles Dico" },
  },
  {
    id: "5",
    code: "ART-005",
    name: "Colchón King Size Sealy",
    status: "active",
    department: { id: 2, code: "03", name: "Entretenimiento" },
    line: { code: "RC", name: "Recámara" },
    supplier: { id: 5, name: "Sealy México" },
  },
  {
    id: "6",
    code: "ART-006",
    name: "Smart TV LG 55 Pulgadas",
    status: "active",
    department: { id: 6, code: "06", name: "Electrónica" },
    line: { code: "TV", name: "Televisores" },
    supplier: { id: 6, name: "LG Electronics" },
  },
  {
    id: "7",
    code: "ART-007",
    name: "Juego de Sala Modular Beige",
    status: "active",
    department: { id: 3, code: "02", name: "Muebles" },
    line: { code: "SL", name: "Sala" },
    supplier: { id: 1, name: "Muebles América" },
  },
  {
    id: "8",
    code: "ART-008",
    name: "Microondas Whirlpool 1.1 pies",
    status: "active",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "MW", name: "Microondas" },
    supplier: { id: 7, name: "Whirlpool México" },
  },
  {
    id: "9",
    code: "ART-009",
    name: "Estufa de Gas 4 Quemadores",
    status: "draft",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "ES", name: "Estufa" },
    supplier: { id: 3, name: "Mabe S.A de C.V" },
  },
  {
    id: "10",
    code: "ART-010",
    name: "Horno Eléctrico Empotrable",
    status: "draft",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "HO", name: "Horno" },
    supplier: { id: 2, name: "Samsung Electronics" },
  },
  {
    id: "11",
    code: "ART-011",
    name: "Lavavajillas Bosch 14 Cubiertos",
    status: "active",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "LA", name: "Lavavajillas" },
    supplier: { id: 8, name: "Bosch México" },
  },
  {
    id: "12",
    code: "ART-012",
    name: "Secadora de Ropa Mabe 20kg",
    status: "active",
    department: { id: 1, code: "04", name: "Línea Blanca" },
    line: { code: "SE", name: "Secadora" },
    supplier: { id: 3, name: "Mabe S.A de C.V" },
  },
];

// Mock departments and suppliers for form selects
// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getProducts(params: GetProductsParams): Promise<GetProductsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...DUMMY_PRODUCTS];

  // Filter by status
  if (params.status && params.status !== "all") {
    filteredData = filteredData.filter((p) => p.status === params.status);
  }

  // Filter by search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter(
      (p) =>
        p.code.toLowerCase().includes(searchLower) ||
        p.name.toLowerCase().includes(searchLower)
    );
  }

  const total = filteredData.length;
  const start = params.page * params.limit;
  const end = start + params.limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    total,
    page: params.page,
    limit: params.limit,
  };
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Productos() {
  const router = useRouter();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Calculate status filter from active tab
  const statusFilter = useMemo(() => {
    if (activeTab === "active") return "active";
    if (activeTab === "draft") return "draft";
    return "all";
  }, [activeTab]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page,
        limit: rowsPerPage,
        search: searchValue,
        status: statusFilter,
      });
      setProducts(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error("[Productos] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchValue, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(0);
  }, [searchValue, activeTab]);

  // Event handlers
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleOpenCreateModal = () => {
    router.push("/catalogos/productos/nuevo");
  };

  const handleOpenEditModal = (product: Product) => {
    router.push(`/catalogos/productos/${product.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const all = DUMMY_PRODUCTS.length;
    const active = DUMMY_PRODUCTS.filter((p) => p.status === "active").length;
    const draft = DUMMY_PRODUCTS.filter((p) => p.status === "draft").length;
    return { all, active, draft };
  }, []);

  // Table columns
  const columns: Column<Product>[] = [
    {
      id: "code",
      label: "CÓDIGO",
      type: "text",
      size: "md",
    },
    {
      id: "status",
      label: "ESTATUS",
      type: "chip",
      size: "sm",
      chipLabelMap: { active: "Activo", draft: "Borrador" },
      chipVariantMap: { active: "success", draft: "default" } as Record<string, StatusChipVariant>,
    },
    {
      id: "name",
      label: "NOMBRE",
      size: "xl",
      truncate: true,
    },
    {
      id: "department",
      label: "DEPARTAMENTO",
      size: "lg",
      format: (value) => {
        const dept = value as Product["department"];
        return `${dept.code} - ${dept.name}`;
      },
    },
    {
      id: "line",
      label: "LÍNEA",
      size: "md",
      format: (value) => {
        const line = value as Product["line"];
        return `${line.code} - ${line.name}`;
      },
    },
    {
      id: "supplier",
      label: "PROVEEDOR",
      size: "lg",
      format: (value) => {
        const supplier = value as Product["supplier"];
        return supplier.name;
      },
    },
  ];

  // Row actions
  const actions: RowAction<Product>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
    },
  ];

  // Tab configuration
  const tabs = [
    { value: "all", label: "Todas", count: tabCounts.all },
    { value: "active", label: "Activos", count: tabCounts.active },
    { value: "draft", label: "Borradores", count: tabCounts.draft },
  ];

  return (
    <MainLayout>
      <HeaderContainer>
        <Title title="Catálogo de productos" />
      </HeaderContainer>

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por código o nombre"
        actions={[
          {
            label: "Nuevo",
            onClick: handleOpenCreateModal,
            variant: "contained",
            color: "primary",
            showIcon: true,
          },
        ]}
      />

      <TableCrud
        columns={columns}
        rows={products}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No hay productos registrados"
      />
    </MainLayout>
  );
}
