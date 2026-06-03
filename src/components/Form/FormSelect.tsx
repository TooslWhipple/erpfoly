import { forwardRef } from "react";
import {
    MenuItem,
    SelectProps,
    Typography,
} from "@mui/material";
import {
    FieldLabel,
    FieldWrapper,
    StyledFormHelperText,
    StyledSelect,
} from "./FormSelect.styles";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface FormSelectProps extends Omit<SelectProps, "variant" | "label" | "placeholder"> {
    label?: string;
    options: SelectOption[];
    required?: boolean;
    helperText?: string;
    placeholder?: string;
}
export const FormSelect = forwardRef<HTMLDivElement, FormSelectProps>(
    ({ label, options, required, error, helperText, placeholder, ...props }, ref) => {
        return (
            <FieldWrapper ref={ref}>
                {
                    label && (
                        <FieldLabel>
                            {label}
                            {required && (
                                <Typography
                                    component="span"
                                    sx={{ color: "error.main", ml: 0.5 }}
                                >
                                    *
                                </Typography>
                            )}
                        </FieldLabel>
                    )}
                <StyledSelect
                    variant="outlined"
                    fullWidth
                    error={error}
                    displayEmpty
                    {...props}
                >
                    {placeholder && (
                        <MenuItem value="" disabled>
                            <Typography sx={{ color: "text.disabled" }}>
                                {placeholder}
                            </Typography>
                        </MenuItem>
                    )}
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </StyledSelect>
                {helperText && (
                    <StyledFormHelperText error={error}>
                        {helperText}
                    </StyledFormHelperText>
                )}
            </FieldWrapper>
        );
    }
);

FormSelect.displayName = "FormSelect";
