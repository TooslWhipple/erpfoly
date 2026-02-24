import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BreadcrumbItem {
    /** Display label */
    label: string;
    /** Navigation path (optional - if not provided, item is not clickable) */
    href?: string;
}

export interface BreadcrumbsProps {
    /** Array of breadcrumb items */
    items: BreadcrumbItem[];
    /** Show back arrow button */
    showBackButton?: boolean;
    /** Custom back navigation handler */
    onBack?: () => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 4,
});

const BackButton = styled(IconButton)(({ theme }) => ({
    width: 36,
    height: 36,
    marginRight: theme.spacing(1),
    padding: 0,
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    color: colors.text.primary,
    boxShadow: "none",
    "&:hover": {
        backgroundColor: colors.background.sidebar,
        borderColor: colors.border,
        boxShadow: "none",
        opacity: 0.9,
    },
    "& .MuiSvgIcon-root": {
        fontSize: 20,
    },
}));

const BreadcrumbLink = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    cursor: "pointer",
    transition: "color 0.15s ease",
    "&:hover": {
        color: theme.palette.text.primary,
    },
}));

const BreadcrumbCurrent = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

const Separator = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.disabled,
    margin: "0 8px",
    userSelect: "none",
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function Breadcrumbs({
    items,
    showBackButton = true,
    onBack,
}: BreadcrumbsProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (items.length > 1 && items[items.length - 2].href) {
            router.push(items[items.length - 2].href!);
        } else {
            router.back();
        }
    };

    const handleNavigate = (href: string) => {
        router.push(href);
    };

    return (
        <Container>
            {showBackButton && (
                <BackButton onClick={handleBack} size="small">
                    <ArrowBackIcon fontSize="small" />
                </BackButton>
            )}

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isClickable = !isLast && item.href;

                return (
                    <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                        {index > 0 && <Separator>›</Separator>}

                        {isClickable ? (
                            <BreadcrumbLink onClick={() => handleNavigate(item.href!)}>
                                {item.label}
                            </BreadcrumbLink>
                        ) : (
                            <BreadcrumbCurrent>{item.label}</BreadcrumbCurrent>
                        )}
                    </Box>
                );
            })}
        </Container>
    );
}
