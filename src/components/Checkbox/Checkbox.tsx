import React from "react";
import { CheckboxOptionIcon, CheckboxOptionButton } from "./Checkbox.styles";

export interface CheckboxProps {
  value: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function Checkbox({
  value,
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange({
      target: { value, checked: !checked },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <CheckboxOptionButton
      role="checkbox"
      aria-checked={checked}
      selected={checked}
      disabled={disabled}
      onClick={handleClick}
    >
      <CheckboxOptionIcon selected={checked} />
      {label}
    </CheckboxOptionButton>
  );
}
