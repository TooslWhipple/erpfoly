import { useRef } from "react";
import { Add as AddIcon, Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import {
    Section,
    SectionTitle,
    SectionDescription,
    GalleryGrid,
    GalleryItem,
    GalleryImage,
    GalleryAddButton,
    GalleryLabel,
    GalleryOverlay,
    GalleryIconButton,
    HiddenFileInput,
    FormCard,
} from "@/styles/catalogos/productos.styles";
import type { ProductGalleryImage } from "@/types/productos.types";
import { Divider, Stack, Typography } from "@mui/material";
import { ImagePlus } from "lucide-react";

interface GalleryTabProps {
    images: ProductGalleryImage[];
    onAddImage: (files: FileList) => void;
    onReplaceImage: (index: number, file: File) => void;
    onRemoveImage?: (index: number) => void;
}

export function GalleryTab({ images, onAddImage, onReplaceImage, onRemoveImage }: GalleryTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

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

    return (
        <FormCard>
            <Stack spacing={0.5}>
                <Typography variant="h6">Galería</Typography>
                <Typography variant="body2" color="text.secondary">Agrega las imágenes del producto</Typography>
            </Stack>
            <Divider />
            <GalleryGrid>
                {
                    images.map((image, index) => (
                        <GalleryItem key={image.id}>
                            <GalleryImage src={image.previewUrl} alt={`Product image ${index + 1}`} />
                            <Typography variant="body1" textAlign="center">{index === 0 ? "Principal" : "Adicional"}</Typography>
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
                    images.length < 6 &&
                    <GalleryItem onClick={handleAddClick}>
                        <GalleryAddButton>
                            <ImagePlus size={24} strokeWidth={2} />
                            <Typography variant="body1" textAlign="center">Agregar imagen</Typography>
                        </GalleryAddButton>
                        <Typography variant="body1" textAlign="center">{images.length === 0 ? "Principal" : "Adicional"}</Typography>
                        <HiddenFileInput
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </GalleryItem>
                }
            </GalleryGrid>
        </FormCard>
    );
}
