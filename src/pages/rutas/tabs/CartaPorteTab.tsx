import { FileUpload } from "@/components";
import type { UploadedFileItem } from "@/components/FileUpload";

export interface CartaPorteTabProps {
  value: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
}

export function CartaPorteTab({ value, onChange }: CartaPorteTabProps) {
  return (
    <FileUpload
      value={value}
      onChange={onChange}
      placeholder="Cargar carta porte"
      accept={["image/*", "application/pdf"]}
    />
  );
}

const RouteCartaPorteTabPage = () => null;

export default RouteCartaPorteTabPage;
