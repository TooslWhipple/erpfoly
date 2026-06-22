import { useRef, useState } from "react";
import { Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import {
    GalleryGrid,
    GalleryItem,
    GalleryImage,
    GalleryAddButton,
    GalleryOverlay,
    GalleryIconButton,
    HiddenFileInput,
    FormCard,
} from "@/styles/catalogos/productos.styles";
import { MAX_PRODUCT_GALLERY_FILES, type ProductGalleryImage } from "@/types/productos.types";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ImagePlus } from "lucide-react";

function galleryImageDisplaySrc(image: ProductGalleryImage): string | undefined {
    const url = (image.previewUrl || image.imageUrl || "").trim();
    return url.length > 0 ? url : undefined;
}

interface GalleryTabProps {
    images: ProductGalleryImage[];
    maxImages?: number;
    onAddImage: (files: FileList | readonly File[]) => void;
    onReplaceImage: (index: number, file: File) => void;
    onRemoveImage?: (index: number) => void;
}

export function GalleryTab({
    images,
    maxImages = MAX_PRODUCT_GALLERY_FILES,
    onAddImage,
    onReplaceImage,
    onRemoveImage,
}: GalleryTabProps) {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
    const dragDepthRef = useRef(0);
    const [dropHighlight, setDropHighlight] = useState(false);

    const canAddMore = images.length < maxImages;

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onAddImage(files);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleEditClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const input = editInputRefs.current.get(index);
        input?.click();
    };

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onReplaceImage(index, files[0]);
            const input = editInputRefs.current.get(index);
            if (input) {
                input.value = "";
            }
        }
    };

    const setEditInputRef = (index: number, element: HTMLInputElement | null) => {
        if (element) {
            editInputRefs.current.set(index, element);
        } else {
            editInputRefs.current.delete(index);
        }
    };

    const handleRemoveClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        onRemoveImage?.(index);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if (!canAddMore) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current += 1;
        setDropHighlight(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!canAddMore) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current -= 1;
        if (dragDepthRef.current <= 0) {
            dragDepthRef.current = 0;
            setDropHighlight(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!canAddMore) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!canAddMore) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current = 0;
        setDropHighlight(false);
        const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (dropped.length > 0) {
            onAddImage(dropped);
        }
    };

    return (
        <FormCard>
            <Stack spacing={0.5}>
                <Typography variant="h6">Galería</Typography>
                <Typography variant="body2" color="text.secondary">
                    Agrega imágenes del artículo. Puedes arrastrar archivos aquí o usar el botón de agregar.
                </Typography>
            </Stack>
            <Divider />
            <Box
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                    marginTop: 2,
                    padding: dropHighlight && canAddMore ? 1.5 : 0,
                    borderRadius: 1,
                    border:
                        dropHighlight && canAddMore
                            ? `2px dashed ${theme.palette.primary.main}`
                            : "2px dashed transparent",
                    backgroundColor:
                        dropHighlight && canAddMore
                            ? theme.palette.action.hover
                            : "transparent",
                    transition: theme.transitions.create(["border-color", "background-color", "padding"], {
                        duration: theme.transitions.duration.short,
                    }),
                }}
            >
                <GalleryGrid>
                    {
                        images.map((image, index) => (
                            <GalleryItem key={image.id}>
                                <GalleryImage
                                    src={galleryImageDisplaySrc(image)}
                                    alt={`Product image ${index + 1}`}
                                />
                                <Typography variant="body1" textAlign="center">
                                    {index === 0 ? "Principal" : "Adicional"}
                                </Typography>
                                <GalleryOverlay data-gallery-overlay>
                                    <GalleryIconButton onClick={(e) => handleEditClick(e, index)}>
                                        <EditIcon />
                                    </GalleryIconButton>
                                    <GalleryIconButton onClick={(e) => handleRemoveClick(e, index)}>
                                        <CloseIcon />
                                    </GalleryIconButton>
                                </GalleryOverlay>
                                <HiddenFileInput
                                    ref={(el) => setEditInputRef(index, el)}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditFileChange(e, index)}
                                />
                            </GalleryItem>
                        ))
                    }
                    {
                        canAddMore && (
                            <GalleryItem onClick={handleAddClick}>
                                <GalleryAddButton>
                                    <ImagePlus size={24} strokeWidth={2} />
                                    <Typography variant="body1" textAlign="center">
                                        Agregar imagen
                                    </Typography>
                                </GalleryAddButton>
                                <Typography variant="body1" textAlign="center">
                                    {images.length === 0 ? "Principal" : "Adicional"}
                                </Typography>
                                <HiddenFileInput
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </GalleryItem>
                        )
                    }
                </GalleryGrid>
            </Box>
        </FormCard>
    );
}
