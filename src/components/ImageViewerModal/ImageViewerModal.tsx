import { Dialog, DialogContent, IconButton, Typography, Stack } from "@mui/material";
import { X } from "lucide-react";
import { Check } from "lucide-react";
import { colors } from "@/styles/theme";

export interface ImageViewerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imageAlt?: string;
}

export function ImageViewerModal({
  open,
  onClose,
  title,
  subtitle,
  imageUrl,
  imageAlt = title,
}: ImageViewerModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.background.sidebar,
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: colors.chip.variants.success.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={10} color="#fff" strokeWidth={3} />
              </div>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Stack>
          )}
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
          <X size={20} />
        </IconButton>
      </div>
      <DialogContent
        sx={{
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a1a",
          minHeight: 400,
        }}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
