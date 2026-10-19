"use client";

import { CodeScannerPanel } from "@/components/CodeScannerPanel";

export interface PhysicalInventoryScannerProps {
  enabled?: boolean;
  onCodeScanned: (code: string) => void;
}

export function PhysicalInventoryScanner({
  enabled = true,
  onCodeScanned,
}: PhysicalInventoryScannerProps) {
  return <CodeScannerPanel enabled={enabled} onCodeScanned={onCodeScanned} />;
}
