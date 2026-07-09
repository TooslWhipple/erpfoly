import { Divider, Stack, Typography } from "@mui/material";
import { ImageGalleryUpload } from "@/components/ImageGalleryUpload";
import { FormCard } from "@/styles/catalogos/productos.styles";
import { MAX_PRODUCT_GALLERY_FILES, type ProductGalleryImage } from "@/types/productos.types";

interface GalleryTabProps {
    images: ProductGalleryImage[];
    maxImages?: number;
    onAddImage: (files: FileList | readonly File[]) => void;
    onReplaceImage: (index: number, file: File) => void;
    onRemoveImage?: (index: number) => void;
}

function productSlotLabel(index: number): string {
    return index === 0 ? "Principal" : "Adicional";
}

export function GalleryTab({
    images,
    maxImages = MAX_PRODUCT_GALLERY_FILES,
    onAddImage,
    onReplaceImage,
    onRemoveImage,
}: GalleryTabProps) {
    return (
        <FormCard>
            <Stack spacing={0.5}>
                <Typography variant="h6">Galería</Typography>
                <Typography variant="body2" color="text.secondary">
                    Agrega imágenes del artículo. Puedes arrastrar archivos aquí o usar el botón de agregar.
                </Typography>
            </Stack>
            <Divider />
            <ImageGalleryUpload
                images={images}
                maxImages={maxImages}
                onAddImages={onAddImage}
                onReplaceImage={onReplaceImage}
                onRemoveImage={onRemoveImage}
                getImageAlt={(_image, index) => `Product image ${index + 1}`}
                getSlotLabel={(index) => productSlotLabel(index)}
            />
        </FormCard>
    );
}
