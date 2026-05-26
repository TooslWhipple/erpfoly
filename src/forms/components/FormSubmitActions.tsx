"use client";

import { CircularProgress } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
    FormActions,
    CancelButton,
    ConfirmButton,
} from "@/components/Form/styles";

export interface FormSubmitActionsProps {
    form: {
        Subscribe: React.ComponentType<{
            selector?: (state: {
                canSubmit: boolean;
                isSubmitting: boolean;
            }) => [boolean, boolean];
            children: (state: [boolean, boolean]) => React.ReactNode;
        }>;
        reset: () => void;
    };
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    disabled?: boolean;
    /** MUI sx prop for the actions container (alignment, spacing, etc.). */
    sx?: SxProps<Theme>;
}

export function FormSubmitActions({
    form,
    onCancel,
    submitLabel = "Guardar",
    cancelLabel = "Cancelar",
    loading = false,
    disabled = false,
    sx,
}: FormSubmitActionsProps) {
    const Subscribe = form.Subscribe as React.ComponentType<{
        selector?: (state: {
            canSubmit: boolean;
            isSubmitting: boolean;
        }) => [boolean, boolean];
        children: (state: [boolean, boolean]) => React.ReactNode;
    }>;
    return (
        <Subscribe
            selector={(state: {
                canSubmit: boolean;
                isSubmitting: boolean;
            }) => [state.canSubmit, state.isSubmitting]}
        >
            {([canSubmit, isSubmitting]) => {
                const submitting = isSubmitting || loading;
                return (
                    <FormActions sx={sx}>
                        {onCancel && (
                            <CancelButton
                                type="button"
                                variant="outlined"
                                onClick={onCancel}
                                disabled={submitting || disabled}
                            >
                                {cancelLabel}
                            </CancelButton>
                        )}
                        <ConfirmButton
                            type="submit"
                            variant="contained"
                            disabled={!canSubmit || submitting || disabled}
                        >
                            {submitting ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                submitLabel
                            )}
                        </ConfirmButton>
                    </FormActions>
                );
            }}
        </Subscribe>
    );
}
