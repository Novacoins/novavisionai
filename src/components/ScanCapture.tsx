import { useRef, useState, useEffect } from "react";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type CapturedImage = { dataUrl: string; file: Blob };

async function fileToCompressedDataUrl(
  file: Blob,
  maxSide = 1280,
  quality = 0.82,
): Promise<CapturedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", quality),
  );
  const dataUrl: string = await new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(blob);
  });
  return { dataUrl, file: blob };
}

export function ScanCapture({
  onCapture,
  loading,
  helperText,
}: {
  onCapture: (img: CapturedImage) => void;
  loading?: boolean;
  helperText?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamOpen, setStreamOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  async function openCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(s);
      setStreamOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      toast.error("Camera unavailable. Try uploading an image instead.");
      cameraRef.current?.click();
    }
  }

  function closeCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setStreamOpen(false);
  }

  async function snap() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));
    const img = await fileToCompressedDataUrl(blob);
    setPreview(img.dataUrl);
    closeCamera();
    onCapture(img);
  }

  async function handleFile(f: File | null) {
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      toast.error("Image too large (max 12 MB)");
      return;
    }
    const img = await fileToCompressedDataUrl(f);
    setPreview(img.dataUrl);
    onCapture(img);
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden glass-card">
          <img
            src={preview}
            alt="Camera scan preview"
            className="w-full max-h-80 object-contain bg-black"
          />
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-sm">
              <div className="text-center text-white">
                <Loader2 className="size-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Analyzing with Nova Vision AI…</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setPreview(null)}
            className="absolute top-3 right-3 size-9 rounded-full bg-black/60 backdrop-blur grid place-items-center text-white"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={openCamera}
            className="h-32 flex-col gap-2 hero-gradient text-primary-foreground glow font-semibold"
          >
            <Camera className="size-7" />
            Take photo
          </Button>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-32 flex-col gap-2 border-dashed"
          >
            <Upload className="size-7" />
            Upload image
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {helperText && (
            <p className="col-span-2 flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-muted/50">
              <ImageIcon className="size-4 shrink-0 mt-0.5" />
              {helperText}
            </p>
          )}
        </div>
      )}

      {streamOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={closeCamera} className="p-2">
              <X className="size-6" />
            </button>
            <span className="text-sm font-medium">Tap to capture</span>
            <span className="w-10" />
          </div>
          <video ref={videoRef} className="flex-1 w-full object-cover" playsInline muted />
          <div className="p-6 grid place-items-center bg-black">
            <button
              onClick={snap}
              className="size-16 rounded-full bg-white grid place-items-center active:scale-95 transition"
              aria-label="Capture"
            >
              <span className="size-12 rounded-full border-4 border-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
