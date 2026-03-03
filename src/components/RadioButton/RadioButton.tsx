import React from "react";
import { RadioOptionIcon, RadioOptionButton } from "./RadioButton.styles";

export interface RadioButtonProps {
    value: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export function RadioButton({
    value,
    label,
    checked,
    onChange,
    disabled = false,
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
            disabled={disabled}
            onClick={handleClick}
        >
            <RadioOptionIcon selected={checked} />
            {label}
        </RadioOptionButton>
    );
}
