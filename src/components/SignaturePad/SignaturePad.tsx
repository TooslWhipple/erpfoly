import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { useTheme } from "@mui/material/styles";
import { SignatureCanvas, SignatureCanvasWrapper } from "./styles";

export interface SignaturePadHandle {
  /** Borra el trazo y notifica `onDrawnChange(false)`. */
  clear: () => void;
  /** PNG del lienzo, o `null` si el navegador no pudo generarlo. */
  toBlob: () => Promise<Blob | null>;
  toDataUrl: () => string | null;
}

export interface SignaturePadProps {
  disabled?: boolean;
  /** Se invoca con `true` al primer trazo y con `false` al limpiar. */
  onDrawnChange?: (drawn: boolean) => void;
  width?: number;
  height?: number;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad(
    { disabled = false, onDrawnChange, width = 900, height = 480 },
    ref,
  ) {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef(false);

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      onDrawnChange?.(false);
    }, [onDrawnChange]);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        toBlob: () =>
          new Promise<Blob | null>((resolve) => {
            const canvas = canvasRef.current;
            if (!canvas) {
              resolve(null);
              return;
            }
            canvas.toBlob((blob) => resolve(blob), "image/png");
          }),
        toDataUrl: () => canvasRef.current?.toDataURL("image/png") ?? null,
      }),
      [clear],
    );

    const getCanvasCoordinates = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      const { x, y } = getCanvasCoordinates(event.clientX, event.clientY);
      context.beginPath();
      context.moveTo(x, y);
      isDrawingRef.current = true;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabled) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      event.preventDefault();
      const { x, y } = getCanvasCoordinates(event.clientX, event.clientY);
      context.lineTo(x, y);
      context.strokeStyle = theme.palette.text.primary;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      onDrawnChange?.(true);
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
        canvasRef.current.releasePointerCapture(event.pointerId);
      }
      isDrawingRef.current = false;
    };

    return (
      <SignatureCanvasWrapper>
        <SignatureCanvas
          ref={canvasRef}
          width={width}
          height={height}
          disabled={disabled}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </SignatureCanvasWrapper>
    );
  },
);
