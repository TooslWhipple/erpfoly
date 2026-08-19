import { useRef, useState } from "react";
import { Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ImagePlus } from "lucide-react";
import {
    GalleryGrid,
    GalleryItem,
    GalleryImage,
    GalleryAddButton,
    GalleryOverlay,
    GalleryIconButton,
    HiddenFileInput,
} from "./ImageGalleryUpload.styledComponents";

export interface ImageGalleryUploadItem {
    id: string;
    previewUrl?: string;
    imageUrl?: string;
    src?: string;
}

export interface ImageGalleryUploadProps<T extends ImageGalleryUploadItem = ImageGalleryUploadItem> {
    images: T[];
    maxImages?: number;
    onAddImages: (files: FileList | readonly File[]) => void;
    onReplaceImage: (index: number, file: File) => void;
    onRemoveImage?: (index: number) => void;
    getImageSrc?: (image: T, index: number) => string | undefined;
    getImageAlt?: (image: T, index: number) => string;
    getSlotLabel?: (index: number, imageCount: number) => string;
    addButtonLabel?: string;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
}

function defaultGetImageSrc(image: ImageGalleryUploadItem): string | undefined {
    const url = (image.previewUrl || image.imageUrl || image.src || "").trim();
    return url.length > 0 ? url : undefined;
}

export function ImageGalleryUpload<T extends ImageGalleryUploadItem>({
    images,
    maxImages = 30,
    onAddImages,
    onReplaceImage,
    onRemoveImage,
    getImageSrc = defaultGetImageSrc,
    getImageAlt = (_image, index) => `Image ${index + 1}`,
    getSlotLabel,
    addButtonLabel = "Agregar imagen",
    accept = "image/*",
    multiple = true,
    disabled = false,
}: ImageGalleryUploadProps<T>) {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
    const dragDepthRef = useRef(0);
    const [dropHighlight, setDropHighlight] = useState(false);

    const canAddMore = !disabled && images.length < maxImages;

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onAddImages(files);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleEditClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        editInputRefs.current.get(index)?.click();
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
            onAddImages(dropped);
        }
    };

    return (
        <Box
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
                padding: dropHighlight && canAddMore ? 1.5 : 0,
                borderRadius: "8px",
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
                {images.map((image, index) => (
                    <GalleryItem key={image.id}>
                        <GalleryImage
                            src={getImageSrc(image, index)}
                            alt={getImageAlt(image, index)}
                        />
                        {getSlotLabel && (
                            <Typography variant="body1" textAlign="center">
                                {getSlotLabel(index, images.length)}
                            </Typography>
                        )}
                        {!disabled && (
                        <GalleryOverlay data-gallery-overlay>
                            <GalleryIconButton onClick={(e) => handleEditClick(e, index)}>
                                <EditIcon />
                            </GalleryIconButton>
                            {onRemoveImage && (
                                <GalleryIconButton onClick={(e) => handleRemoveClick(e, index)}>
                                    <CloseIcon />
                                </GalleryIconButton>
                            )}
                        </GalleryOverlay>
                        )}
                        <HiddenFileInput
                            ref={(el) => setEditInputRef(index, el)}
                            type="file"
                            accept={accept}
                            onChange={(e) => handleEditFileChange(e, index)}
                        />
                    </GalleryItem>
                ))}
                {canAddMore && (
                    <GalleryItem onClick={handleAddClick}>
                        <GalleryAddButton>
                            <ImagePlus size={24} strokeWidth={2} />
                            <Typography variant="body1" textAlign="center">
                                {addButtonLabel}
                            </Typography>
                        </GalleryAddButton>
                        {getSlotLabel && (
                            <Typography variant="body1" textAlign="center">
                                {getSlotLabel(images.length, images.length)}
                            </Typography>
                        )}
                        <HiddenFileInput
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            multiple={multiple}
                            onChange={handleFileChange}
                        />
                    </GalleryItem>
                )}
            </GalleryGrid>
        </Box>
    );
}
