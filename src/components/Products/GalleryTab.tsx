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
} from "@/styles/catalogos/productos.styles";

// ============================================================================
// TYPES
// ============================================================================

interface GalleryTabProps {
    images: string[];
    onAddImage: (files: FileList) => void;
    onReplaceImage: (index: number, file: File) => void;
    onRemoveImage?: (index: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

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
            // Reset input to allow selecting the same file again
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
            // Reset input to allow selecting the same file again
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
        <Section>
            <SectionTitle>Galería</SectionTitle>
            <SectionDescription>
                Agrega las imágenes del producto
            </SectionDescription>
            <GalleryGrid>
                {images.map((image, index) => (
                    <GalleryItem key={index}>
                        <GalleryImage src={image} alt={`Product image ${index + 1}`} />
                        <GalleryLabel>
                            {index === 0 ? "Principal" : "Adicional"}
                        </GalleryLabel>
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
                ))}
                {images.length < 6 && (
                    <GalleryItem onClick={handleAddClick}>
                        <GalleryAddButton>
                            <AddIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                        </GalleryAddButton>
                        <HiddenFileInput
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </GalleryItem>
                )}
            </GalleryGrid>
        </Section>
    );
}
