import { forwardRef } from "react";
import { TextFieldProps, Typography } from "@mui/material";
import { FieldLabel, FieldWrapper, StyledTextField } from "./FormTextField.styles";

export interface FormTextFieldProps extends Omit<TextFieldProps, "variant" | "label"> {
    label?: string;
    required?: boolean;
}

export const FormTextField = forwardRef<HTMLDivElement, FormTextFieldProps>(
    ({ label, required, error, helperText, select, SelectProps, ...props }, ref) => {
        const mergedSelectProps = select
            ? { displayEmpty: true, ...SelectProps }
            : SelectProps;

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
                    error={error}
                    helperText={helperText}
                    select={select}
                    SelectProps={mergedSelectProps}
                    {...props}
                />
            </FieldWrapper>
        );
    }
);

FormTextField.displayName = "FormTextField";
