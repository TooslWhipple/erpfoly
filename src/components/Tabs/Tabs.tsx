import React from "react";
import {
  TabsContainer,
  TabsWrapper,
  StyledTabs,
  StyledTab,
  TabsRightSection,
} from "./styles";

export interface TabItem {
  /** Unique value identifier for the tab */
  value: string;
  /** Display label for the tab */
  label: string;
  /** Optional count to display next to the label */
  count?: number;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items to render */
  tabs: TabItem[];
  /** Currently active tab value */
  value: string;
  /** Callback when tab changes */
  onChange: (value: string) => void;
  /** Whether to show bottom border */
  withBorder?: boolean;
  /** Whether tabs container should take full width */
  fullWidth?: boolean;
  /** Optional content to render on the right side of tabs */
  rightContent?: React.ReactNode;
  /** Tab variant - scrollable allows horizontal scroll, standard wraps */
  variant?: "scrollable" | "standard" | "fullWidth";
  /** Whether to show scroll buttons when scrollable */
  scrollButtons?: boolean | "auto";
  /** Additional CSS class name */
  className?: string;
}

export function Tabs({
  tabs,
  value,
  onChange,
  withBorder = true,
  fullWidth = false,
  rightContent,
  variant = "scrollable",
  scrollButtons = false,
  className,
}: TabsProps) {
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  const formatTabLabel = (tab: TabItem): string => {
    if (tab.count !== undefined) {
      return `${tab.label} (${tab.count})`;
    }
    return tab.label;
  };

  return (
    <TabsContainer withBorder={withBorder} fullWidth={fullWidth} className={className}>
      <TabsWrapper>
        <StyledTabs
          value={value}
          onChange={handleChange}
          variant={variant}
          scrollButtons={scrollButtons}
        >
          {tabs.map((tab) => (
            <StyledTab
              key={tab.value}
              label={formatTabLabel(tab)}
              value={tab.value}
              disabled={tab.disabled}
            />
          ))}
        </StyledTabs>
      </TabsWrapper>

      {rightContent && <TabsRightSection>{rightContent}</TabsRightSection>}
    </TabsContainer>
  );
}
