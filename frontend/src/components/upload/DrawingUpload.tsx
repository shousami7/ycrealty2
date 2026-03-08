import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { uploadDrawing } from "@/api/client";
import { useSceneStore } from "@/store/sceneStore";

export function DrawingUpload() {
  const { setScene, setDrawingPreview, setLoading, setError, isLoading, error, drawingPreviewUrl } =
    useSceneStore();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      if (drawingPreviewUrl) {
        URL.revokeObjectURL(drawingPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setDrawingPreview(previewUrl, file.name);

      setLoading(true);
      setError(null);
      try {
        const scene = await uploadDrawing(file);
        setScene(scene.layout, scene.bounding_box);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [drawingPreviewUrl, setDrawingPreview, setScene, setLoading, setError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
        Floor Plan
      </h2>

      <div
        {...getRootProps()}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
          isDragActive
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/50",
          isLoading ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-white/60">Analyzing drawing…</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-white/40" />
            <p className="text-sm text-white/60 text-center">
              {isDragActive
                ? "Drop to analyze"
                : "Drop a floor plan here, or click to browse"}
            </p>
            <p className="text-xs text-white/30">PNG · JPG · WebP · PDF</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
