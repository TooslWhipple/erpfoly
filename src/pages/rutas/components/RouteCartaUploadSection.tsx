import { useCallback, useEffect, useMemo, useState } from "react";

import type { UploadedFileItem } from "@/components/FileUpload";
import { CartaPorteTab } from "@/components/RouteTabs";

interface RouteCartaUploadSectionProps {
  serverFiles: UploadedFileItem[];
  readOnly?: boolean;
  onPendingLocalFile: (file: File | undefined) => void;
  onRemoveServerDocument: (documentId: number) => void;
}

export function RouteCartaUploadSection({
  serverFiles,
  readOnly = false,
  onPendingLocalFile,
  onRemoveServerDocument,
}: RouteCartaUploadSectionProps) {
  const [addon, setAddon] = useState<UploadedFileItem[]>([]);
  const merged = useMemo(
    () => [...serverFiles, ...addon],
    [serverFiles, addon],
  );

  useEffect(() => {
    onPendingLocalFile(addon.find((f) => f.file)?.file);
  }, [addon, onPendingLocalFile]);

  const handleChange = useCallback(
    (files: UploadedFileItem[]) => {
      if (readOnly) return;
      for (const sf of serverFiles) {
        const stillPresent = files.some(
          (f) => String(f.id) === String(sf.id),
        );
        if (!stillPresent) {
          const docId = Number(sf.id);
          if (Number.isFinite(docId)) {
            onRemoveServerDocument(docId);
          }
        }
      }

      const locals = files.filter((f) => Boolean(f.file));
      setAddon(locals);
      onPendingLocalFile(locals[0]?.file);
    },
    [readOnly, serverFiles, onPendingLocalFile, onRemoveServerDocument],
  );

  return (
    <CartaPorteTab value={merged} onChange={handleChange} disabled={readOnly} />
  );
}

const RouteCartaUploadSectionPage = () => null;

export default RouteCartaUploadSectionPage;
