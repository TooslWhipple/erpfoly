import { FileUpload } from "@/components";
import type { UploadedFileItem } from "@/components/FileUpload";

export interface CartaPorteTabProps {
  value: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  disabled?: boolean;
}

export function CartaPorteTab({
  value,
  onChange,
  disabled = false,
}: CartaPorteTabProps) {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      placeholder="Cargar carta porte"
      accept={["image/*", "application/pdf"]}
      disabled={disabled}
    />
  );
}
