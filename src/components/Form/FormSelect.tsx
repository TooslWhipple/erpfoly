import { forwardRef } from "react";
import { styled } from "@mui/material/styles";
import {
    Box,
    Select,
    SelectProps,
    MenuItem,
    FormHelperText,
    Typography,
} from "@mui/material";

const FieldWrapper = styled(Box)({
    display: "flex",
    flexDirection: "column",
    width: "100%",
});

const FieldLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    height: 36,
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.divider,
        borderWidth: 1,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.text.disabled,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
    },
    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.error.main,
    },
    "&.Mui-disabled": {
        backgroundColor: theme.palette.action.disabledBackground,
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
        },
    },
    "& .MuiSelect-select": {
        padding: "8px 12px",
        fontSize: "0.875rem",
        display: "flex",
        alignItems: "center",
    },
})) as unknown as typeof Select;

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
    marginLeft: 0,
    marginTop: theme.spacing(0.5),
}));
    
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
                {label && (
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
