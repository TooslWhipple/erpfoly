import { Box, IconButton, TextField } from "@mui/material";
import { Remove as RemoveIcon, Add as AddIcon } from "@mui/icons-material";
import {
    NumberInputWrapper,
    NumberInputButton,
    NumberInputField,
} from "@/styles/catalogos/folypuntos.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NumberInputProps {
    /** Current value */
    value: number;
    /** Callback when value changes */
    onChange: (value: number) => void;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Step size for increment/decrement */
    step?: number;
    /** Disable the input */
    disabled?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Width of the input */
    width?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NumberInput({
    value,
    onChange,
    min = 1,
    max = 999999,
    step = 1,
    disabled = false,
    placeholder = "0",
    width = 80,
}: NumberInputProps) {
    const handleIncrement = () => {
        const newValue = value + step;
        if (newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Allow empty string for clearing
        if (inputValue === "") {
            onChange(min);
            return;
        }

        // Only allow positive integers
        if (/^\d+$/.test(inputValue)) {
            const numValue = parseInt(inputValue, 10);
            if (numValue >= min && numValue <= max) {
                onChange(numValue);
            } else if (numValue < min) {
                onChange(min);
            } else if (numValue > max) {
                onChange(max);
            }
        }
    };

    const handleBlur = () => {
        // Ensure value is within bounds on blur
        if (value < min) {
            onChange(min);
        } else if (value > max) {
            onChange(max);
        }
    };

    return (
        <NumberInputWrapper>
            <NumberInputButton
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                size="small"
            >
                <RemoveIcon fontSize="small" />
            </NumberInputButton>
            <NumberInputField
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                inputProps={{
                    style: { textAlign: "center" },
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                }}
                sx={{ width, flex: 1 }}
            />
            <NumberInputButton
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                size="small"
            >
                <AddIcon fontSize="small" />
            </NumberInputButton>
        </NumberInputWrapper>
    );
}
