import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import {
    BackButton,
    BreadcrumbCurrent,
    BreadcrumbLink,
    Container,
    Separator,
} from "./Breadcrumbs.styles";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    showBackButton?: boolean;
    onBack?: () => void;
}

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
