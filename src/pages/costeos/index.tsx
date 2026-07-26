import { Alert, Button, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { Title, TabFilters, CosteoList } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { CosteoCardData } from "@/components/CosteoCard";
import { useCosteosList } from "@/hooks/costeos/useCosteosList";

const LIST_TABS: TabOption[] = [
  { label: "Todos", value: "all" },
  { label: "Capturados", value: "captured" },
  { label: "Recibidos", value: "received" },
  { label: "Pedidos", value: "ordered" },
];

export default function CosteosPage() {
  const router = useRouter();
  const {
    items,
    loading,
    activeTab,
    isEmpty,
    handleTabChange
  } = useCosteosList();

  const navigateToDetail = (costeo: CosteoCardData) => {
    void router.push(`/costeos/${costeo.id}`);
  };

  return (
    <Stack spacing={3}>
      <Title title="Costeos" />

      <TabFilters
        tabs={LIST_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <CosteoList
        costeos={items}
        loading={loading}
        onCosteoClick={navigateToDetail}
        onViewDetail={navigateToDetail}
        emptyMessage={
          isEmpty ? "No hay costeos para este filtro" : "No hay costeos"
        }
      />
    </Stack>
  );
}
