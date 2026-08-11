import { Inventory2 as BoxIcon } from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { ProductInfoCard } from "@/components/InventoryDetail";
import { TableCrud } from "@/components/TableCrud";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import {
    GalleryContainer,
    GalleryImage,
    PackagesList,
    PackageItem,
    PackageIcon,
    PackageInfo,
    PackagePrice,
    PricingItem,
} from "@/styles/inventario/detalle.styles";
import type {
    InventoryDetail,
    ProductSupplier,
    PricingStrategy,
    ProductPackage,
    ProductGallery,
} from "@/types/inventario.types";
import numeral from "numeral";

export type ProductFormEditTab =
    | "general"
    | "suppliers"
    | "price"
    | "gallery"
    | "packages";

export interface TechnicalTabProps {
    productId: string | number;
    inventoryDetail: InventoryDetail;
    suppliers: ProductSupplier[];
    pricingStrategy: PricingStrategy;
    packages: ProductPackage[];
    gallery: ProductGallery;
    loading: boolean;
}

const SUPPLIERS_CHIP_LABELS: Record<string, string> = {
  principal: "Principal",
  secondary: "Secundario",
};
const SUPPLIERS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
    principal: "warning",
    secondary: "default",
};

const suppliersColumns: Column<ProductSupplier>[] = [
    {
        id: "supplierId",
        label: "ID",
        size: "md",
    },
    {
        id: "supplierName",
        label: "PROVEEDOR",
        size: "xl",
    },
    {
        id: "status",
        label: "ESTATUS",
        type: "chip",
        size: "sm",
        chipLabelMap: SUPPLIERS_CHIP_LABELS,
        chipVariantMap: SUPPLIERS_CHIP_VARIANTS,
    },
];

export function TechnicalTab({
    productId,
    inventoryDetail,
    suppliers,
    pricingStrategy,
    packages,
    gallery,
    loading,
}: TechnicalTabProps) {
    const router = useRouter();

    const handleEdit = useCallback(
        (tab: ProductFormEditTab) => {
            void router.push(
                `/catalogos/productos/${productId}?tab=${tab}`,
            );
        },
        [productId, router],
    );

    const generalInfoFields = [
        { label: "Nombre corto", value: inventoryDetail.shortName },
        { label: "Descripción del artículo", value: inventoryDetail.description },
        { label: "Departamento", value: `${inventoryDetail.department.code} - ${inventoryDetail.department.name}` },
        { label: "Línea", value: `${inventoryDetail.line.code} - ${inventoryDetail.line.name}` },
        { label: "Garantía", value: inventoryDetail.warranty },
    ];

    return (
        <>
            <ProductInfoCard
                title="Información general"
                subtitle="Detalles completos del artículo"
                fields={generalInfoFields}
                onEdit={() => handleEdit("general")}
            />

            <ProductInfoCard
                title="Proveedores"
                subtitle="Proveedores autorizados para este artículo"
                onEdit={() => handleEdit("suppliers")}
            >
                <TableCrud
                    columns={suppliersColumns}
                    rows={suppliers}
                    loading={loading}
                    rowKey="id"
                    emptyMessage="No hay proveedores asignados"
                />
            </ProductInfoCard>

            <ProductInfoCard
                title="Estrategia de Precios"
                subtitle="Configuración de precios y márgenes"
                onEdit={() => handleEdit("price")}
            >
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <PricingItem>
                            <Typography variant="body2" color="text.secondary">Costo</Typography>
                            <Typography variant="h5">{numeral(pricingStrategy.cost).format("$0,0.00")}</Typography>
                        </PricingItem>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <PricingItem>
                            <Typography variant="body2" color="text.secondary">Precio de lista</Typography>
                            <Typography variant="h5">{numeral(pricingStrategy.listPrice).format("$0,0.00")}</Typography>
                        </PricingItem>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <PricingItem>
                            <Typography variant="body2" color="text.secondary">Riguroso contado</Typography>
                            <Typography variant="h5">{numeral(pricingStrategy.cashPrice).format("$0,0.00")}</Typography>
                        </PricingItem>
                    </Grid>
                </Grid>
            </ProductInfoCard>

            <ProductInfoCard
                title="Galería"
                subtitle="Imágenes del artículo"
                onEdit={() => handleEdit("gallery")}
            >
                <GalleryContainer>
                    {gallery.images.map((image, index) => (
                        <GalleryImage key={index}>
                            <img src={image} alt={`Product image ${index + 1}`} />
                        </GalleryImage>
                    ))}
                </GalleryContainer>
            </ProductInfoCard>

            <ProductInfoCard
                title="Paquetes"
                subtitle="Paquetes especiales"
                onEdit={() => handleEdit("packages")}
            >
                <PackagesList>
                    {packages.map((pkg) => (
                        <PackageItem key={pkg.id}>
                            <PackageIcon>
                                <BoxIcon />
                            </PackageIcon>
                            <PackageInfo>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                    {pkg.articleName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Cantidad: {pkg.quantity} Ult. precio:{" "}
                                    {numeral(pkg.lastPrice).format("$0,0.00")}
                                </Typography>
                            </PackageInfo>
                            <PackagePrice>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Precio paquete:
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {numeral(pkg.packagePrice).format("$0,0.00")}
                                </Typography>
                            </PackagePrice>
                        </PackageItem>
                    ))}
                </PackagesList>
            </ProductInfoCard>
        </>
    );
}

const SkuTechnicalTabPage = () => null;

export default SkuTechnicalTabPage;
