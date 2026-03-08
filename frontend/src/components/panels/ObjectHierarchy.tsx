import { useSceneStore } from "@/store/sceneStore";
import type { SelectedElement } from "@/types/scene";
import { Layers, Square, DoorOpen, AppWindow } from "lucide-react";

export function ObjectHierarchy() {
  const layout = useSceneStore((s) => s.layout);
  const selected = useSceneStore((s) => s.selected);
  const setSelected = useSceneStore((s) => s.setSelected);

  if (!layout) {
    return (
      <div className="p-4 text-white/30 text-sm">
        No scene loaded yet.
      </div>
    );
  }

  function row(el: SelectedElement, label: string, icon: React.ReactNode) {
    const isSelected =
      selected?.type === el?.type && selected?.id === el?.id;
    return (
      <button
        key={`${el?.type}-${el?.id}`}
        onClick={() => setSelected(el)}
        className={[
          "flex items-center gap-2 w-full px-3 py-1.5 rounded text-sm text-left transition-colors",
          isSelected ? "bg-accent text-white" : "text-white/60 hover:bg-white/5",
        ].join(" ")}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {layout.rooms.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">
            Rooms
          </p>
          {layout.rooms.map((r) =>
            row(
              { type: "room", id: r.id },
              r.name,
              <Layers className="h-3.5 w-3.5 shrink-0" />,
            ),
          )}
        </section>
      )}

      {layout.walls.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">
            Walls
          </p>
          {layout.walls.map((w) =>
            row(
              { type: "wall", id: w.id },
              w.id,
              <Square className="h-3.5 w-3.5 shrink-0" />,
            ),
          )}
        </section>
      )}

      {layout.doors.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">
            Doors
          </p>
          {layout.doors.map((d) =>
            row(
              { type: "door", id: d.id },
              d.id,
              <DoorOpen className="h-3.5 w-3.5 shrink-0" />,
            ),
          )}
        </section>
      )}

      {layout.windows.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">
            Windows
          </p>
          {layout.windows.map((w) =>
            row(
              { type: "window", id: w.id },
              w.id,
              <AppWindow className="h-3.5 w-3.5 shrink-0" />,
            ),
          )}
        </section>
      )}
    </div>
  );
}
