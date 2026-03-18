import { Divider } from "@mui/material";
import { TabsList, TabButton } from "./styles";

export interface VerticalSidebarTabItem {
  value: string;
  label: string;
}

export interface VerticalSidebarTabsProps {
  tabs: VerticalSidebarTabItem[];
  value: string;
  onChange: (value: string) => void;
  dividerBeforeValue?: string;
}

export function VerticalSidebarTabs({
  tabs,
  value,
  onChange,
  dividerBeforeValue,
}: VerticalSidebarTabsProps) {
  return (
    <TabsList>
      {
        tabs.map((tab) => (
          <div key={tab.value}>
            {
              dividerBeforeValue === tab.value && <Divider style={{ marginBottom: "16px" }} />
            }
            <TabButton
              type="button"
              selected={value === tab.value}
              onClick={() => onChange(tab.value)}>
              {tab.label}
            </TabButton>
          </div>
        ))
      }
    </TabsList>
  );
}
