"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import type { PhysicalInventoryLastScannedProduct } from "@/types/physical-inventory.types";
import { theme } from "@/styles/theme";
import { Card } from "@/components/PhysicalInventory/Card";

export interface PhysicalInventoryLastScannedCardProps {
  product: PhysicalInventoryLastScannedProduct;
  onRemove: () => void;
}

export function PhysicalInventoryLastScannedCard({
  product,
  onRemove,
}: PhysicalInventoryLastScannedCardProps) {
  const description =
    product.description?.trim() &&
      product.description.trim().toLowerCase() !== product.name.trim().toLowerCase()
      ? product.description.trim()
      : null;

  return (
    <Card>
      <Typography variant="subtitle1" fontWeight={700}>Último artículo escaneado</Typography>

      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 1.5,
          border: `1px solid ${theme.palette.app.border}`,
          overflow: "hidden",
          bgcolor: theme.palette.background.lowerGray,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {
          product.imageUrl &&
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        }
      </Box>

      <Stack spacing={0.5}>
        <Typography variant="subtitle1" fontWeight={700}>{product.name}</Typography>
        {
          description && <Typography variant="body2" fontWeight={600}>{description}</Typography>
        }
        <Typography variant="body2" color="text.secondary">
          {product.code}
          {product.isSurplus ? " · Sobrante" : ""}
        </Typography>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">Proveedor</Typography>
        <Typography variant="body1">{product.supplierName}</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">Departamento</Typography>
        <Typography variant="body1">{product.department}</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">Línea</Typography>
        <Typography variant="body1">{product.line}</Typography>
      </Stack>

      <Button variant="option" color="inherit" fullWidth onClick={onRemove}>
        Remover artículo
      </Button>
    </Card>
  );
}
