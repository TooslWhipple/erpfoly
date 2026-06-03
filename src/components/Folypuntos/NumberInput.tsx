import { Remove as RemoveIcon, Add as AddIcon } from "@mui/icons-material";
import {
    NumberInputWrapper,
    NumberInputButton,
    NumberInputField,
    StepperUnitLabel,
} from "@/styles/catalogos/folypuntos.styles";

export interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    placeholder?: string;
    width?: number;
    size?: "small" | "medium";
    unit?: string;
}

export function NumberInput({
    value,
    onChange,
    min = 1,
    max = 999999,
    step = 1,
    disabled = false,
    placeholder = "0",
    width = 80,
    size = "medium",
    unit,
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
        
        if (inputValue === "") {
            onChange(min);
            return;
        }

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
        if (value < min) {
            onChange(min);
        } else if (value > max) {
            onChange(max);
        }
    };

    const iconSize = size === "small" ? "small" : "small";
    const buttonSize = size === "small" ? "small" : "small";

    return (
        <NumberInputWrapper size={size}>
            <NumberInputButton
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                size={buttonSize}
                inputSize={size}
            >
                <RemoveIcon fontSize={iconSize} />
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
                inputSize={size}
            />
            <NumberInputButton
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                size={buttonSize}
                inputSize={size}
            >
                <AddIcon fontSize={iconSize} />
            </NumberInputButton>
            {unit != null && unit !== "" && <StepperUnitLabel>{unit}</StepperUnitLabel>}
        </NumberInputWrapper>
    );
}
