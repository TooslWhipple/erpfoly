import React from "react";
import {
    RadioOptionAdornment,
    RadioOptionButton,
    RadioOptionIcon,
    RadioOptionLabel,
} from "./RadioButton.styles";

export interface RadioButtonProps {
    value: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    size?: "small" | "medium";
    backgroundColor?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export function RadioButton({
    value,
    label,
    checked,
    onChange,
    disabled = false,
    fullWidth = false,
    size = "medium",
    backgroundColor = "transparent",
    startIcon,
    endIcon
}: RadioButtonProps) {
    const handleClick = () => {
        if (disabled) return;
        onChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <RadioOptionButton
            role="radio"
            aria-checked={checked}
            selected={checked}
            fullWidth={fullWidth}
            size={size}
            disabled={disabled}
            backgroundColor={backgroundColor}
            onClick={handleClick}
        >
            <RadioOptionIcon selected={checked} />
            {startIcon && <RadioOptionAdornment>{startIcon}</RadioOptionAdornment>}
            <RadioOptionLabel>{label}</RadioOptionLabel>
            {endIcon && <RadioOptionAdornment>{endIcon}</RadioOptionAdornment>}
        </RadioOptionButton>
    );
}
