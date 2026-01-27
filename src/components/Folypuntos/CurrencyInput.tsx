import { Remove as RemoveIcon, Add as AddIcon } from "@mui/icons-material";
import {
    CurrencyInputWrapper,
    CurrencyInputField,
    CurrencySymbol,
    NumberInputButton,
} from "@/styles/catalogos/folypuntos.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CurrencyInputProps {
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
    /** Currency symbol */
    currencySymbol?: string;
    /** Number of decimal places */
    decimals?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CurrencyInput({
    value,
    onChange,
    min = 0.01,
    max = 999999.99,
    step = 0.01,
    disabled = false,
    placeholder = "0.00",
    currencySymbol = "$",
    decimals = 2,
}: CurrencyInputProps) {
    const handleIncrement = () => {
        const newValue = parseFloat((value + step).toFixed(decimals));
        if (newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = parseFloat((value - step).toFixed(decimals));
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

        // Allow numbers with decimal point
        if (/^\d*\.?\d*$/.test(inputValue)) {
            const numValue = parseFloat(inputValue);
            if (!isNaN(numValue)) {
                if (numValue >= min && numValue <= max) {
                    onChange(parseFloat(numValue.toFixed(decimals)));
                } else if (numValue < min) {
                    onChange(min);
                } else if (numValue > max) {
                    onChange(max);
                }
            }
        }
    };

    const handleBlur = () => {
        // Ensure value is within bounds and properly formatted on blur
        let formattedValue = value;
        if (value < min) {
            formattedValue = min;
        } else if (value > max) {
            formattedValue = max;
        }
        onChange(parseFloat(formattedValue.toFixed(decimals)));
    };

    const displayValue = value.toFixed(decimals);

    return (
        <CurrencyInputWrapper>
            <NumberInputButton
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                size="small"
            >
                <RemoveIcon fontSize="small" />
            </NumberInputButton>
            <CurrencyInputField
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                inputProps={{
                    style: { textAlign: "center" },
                    inputMode: "decimal",
                }}
            />
            <CurrencySymbol>{currencySymbol}</CurrencySymbol>
            <NumberInputButton
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                size="small"
            >
                <AddIcon fontSize="small" />
            </NumberInputButton>
        </CurrencyInputWrapper>
    );
}
