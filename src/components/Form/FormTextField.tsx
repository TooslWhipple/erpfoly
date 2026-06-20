import { forwardRef } from "react";
import { TextFieldProps, Typography } from "@mui/material";
import { FieldLabel, FieldWrapper, StyledTextField } from "./FormTextField.styles";

export interface FormTextFieldProps extends Omit<TextFieldProps, "variant" | "label"> {
    label?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
}

const HiddenSelectIcon = () => null;

export const FormTextField = forwardRef<HTMLDivElement, FormTextFieldProps>(
    ({ label, required, error, helperText, select, SelectProps, readOnly, disabled, InputProps, ...props }, ref) => {
        const mergedSelectProps = select
            ? {
                displayEmpty: true,
                ...SelectProps,
                ...(readOnly
                    ? { open: false, IconComponent: HiddenSelectIcon }
                    : {}),
            }
            : SelectProps;

        const mergedInputProps = {
            ...InputProps,
            ...(readOnly ? { readOnly: true } : {}),
        };

        return (
            <FieldWrapper>
                {
                    label &&
                    <FieldLabel>
                        {label}
                        {
                            required &&
                            <Typography component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Typography>
                        }
                    </FieldLabel>
                }
                <StyledTextField
                    ref={ref}
                    variant="outlined"
                    fullWidth
                    error={Boolean(error)}
                    helperText={helperText}
                    select={select}
                    disabled={disabled}
                    InputProps={mergedInputProps}
                    SelectProps={mergedSelectProps}
                    {...props}
                />
            </FieldWrapper>
        );
    }
);

FormTextField.displayName = "FormTextField";
