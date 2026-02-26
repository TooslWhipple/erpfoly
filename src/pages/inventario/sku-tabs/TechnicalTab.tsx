import { Inventory2 as BoxIcon } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { ProductInfoCard } from "@/components/InventoryDetail";
import { TableCrud } from "@/components/TableCrud";
import type { Column } from "@/components/TableCrud";
import {
    GalleryContainer,
    GalleryImage,
    PackagesList,
    PackageItem,
    PackageIcon,
    PackageInfo,
    PackagePrice,
    PricingGrid,
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

export interface TechnicalTabProps {
    inventoryDetail: InventoryDetail;
    suppliers: ProductSupplier[];
    pricingStrategy: PricingStrategy;
    packages: ProductPackage[];
    gallery: ProductGallery;
    loading: boolean;
}

const SUPPLIERS_CHIP_CONFIG = {
    principal: {
        label: "Principal",
        bgColor: "#FEF3C7",
        textColor: "#92400E",
    },
    secondary: {
        label: "Secundario",
        bgColor: "#F3F4F6",
        textColor: "#6B7280",
    },
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
        chipConfig: SUPPLIERS_CHIP_CONFIG,
    },
];

export function TechnicalTab({
    inventoryDetail,
    suppliers,
    pricingStrategy,
    packages,
    gallery,
    loading,
}: TechnicalTabProps) {
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
            />

            <ProductInfoCard
                title="Proveedores"
                subtitle="Proveedores autorizados para este artículo"
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
            >
                <PricingGrid>
                    <PricingItem>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Costo
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {numeral(pricingStrategy.cost).format("$0,0.00")}
                        </Typography>
                    </PricingItem>
                    <PricingItem>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Precio de lista
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {numeral(pricingStrategy.listPrice).format("$0,0.00")}
                        </Typography>
                    </PricingItem>
                    <PricingItem>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Riguroso contado
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {numeral(pricingStrategy.cashPrice).format("$0,0.00")}
                        </Typography>
                    </PricingItem>
                </PricingGrid>
            </ProductInfoCard>

            <ProductInfoCard
                title="Galería"
                subtitle="Imágenes del artículo"
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
