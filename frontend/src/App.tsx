import { DrawingUpload } from "@/components/upload/DrawingUpload";
import { ObjectHierarchy } from "@/components/panels/ObjectHierarchy";
import { useSceneStore } from "@/store/sceneStore";
import { exportIfc } from "@/api/client";
import { Download } from "lucide-react";

const defaultVisualUrl = "/testimage(1).jpg";

export default function App() {
  const layout = useSceneStore((s) => s.layout);

  async function handleExport() {
    if (!layout) return;
    const blob = await exportIfc(layout, "BIM Export");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.ifc";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-screen bg-panel text-white overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-surface">
        <div className="px-4 py-3 border-b border-border">
          <h1 className="text-base font-semibold tracking-tight">AI BIM Platform</h1>
          <p className="text-xs text-white/40">MVP</p>
        </div>

        <DrawingUpload />

        <div className="border-t border-border mt-auto">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
              Scene
            </p>
            <ObjectHierarchy />
          </div>
        </div>
      </aside>

      {/* 3D Viewport */}
      <main className="flex-1 relative bg-[#111]">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleExport}
            disabled={!layout}
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export BIM
          </button>
        </div>

        {layout ? (
          <div className="h-full w-full p-6">
            <div className="h-full w-full rounded-xl border border-border/80 bg-black/20 overflow-hidden">
              <img
                src={defaultVisualUrl}
                alt="Default visual"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            Upload a floor plan to begin
          </div>
        )}
      </main>
    </div>
  );
}
