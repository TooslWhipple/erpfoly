import { forwardRef } from "react";
import {
    FormControl,
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
        const hasError = Boolean(error);
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
                <FormControl fullWidth error={hasError}>
                    <StyledSelect
                        variant="outlined"
                        fullWidth
                        error={hasError}
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
                    {helperText ? (
                        <StyledFormHelperText error={hasError}>
                            {helperText}
                        </StyledFormHelperText>
                    ) : null}
                </FormControl>
            </FieldWrapper>
        );
    }
);

FormSelect.displayName = "FormSelect";
