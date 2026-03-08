import { useSceneStore } from "@/store/sceneStore";

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/40">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-border rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
      />
    </div>
  );
}

export function PropertiesPanel() {
  const layout = useSceneStore((s) => s.layout);
  const selected = useSceneStore((s) => s.selected);
  const { updateWall, updateDoor, updateWindow, updateRoom } = useSceneStore();

  if (!selected) {
    return (
      <div className="p-4 text-white/30 text-sm">
        Select an element to edit its properties.
      </div>
    );
  }

  if (selected.type === "wall") {
    const wall = layout?.walls.find((w) => w.id === selected.id);
    if (!wall) return null;
    return (
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-white">Wall — {wall.id}</h3>
        <Field
          label="Height (m)"
          value={wall.height}
          type="number"
          onChange={(v) => updateWall(wall.id, { height: parseFloat(v) })}
        />
        <Field
          label="Thickness (m)"
          value={wall.thickness}
          type="number"
          onChange={(v) => updateWall(wall.id, { thickness: parseFloat(v) })}
        />
        <Field
          label="Material"
          value={wall.material}
          onChange={(v) => updateWall(wall.id, { material: v })}
        />
      </div>
    );
  }

  if (selected.type === "door") {
    const door = layout?.doors.find((d) => d.id === selected.id);
    if (!door) return null;
    return (
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-white">Door — {door.id}</h3>
        <Field
          label="Width (m)"
          value={door.width}
          type="number"
          onChange={(v) => updateDoor(door.id, { width: parseFloat(v) })}
        />
        <Field
          label="Height (m)"
          value={door.height}
          type="number"
          onChange={(v) => updateDoor(door.id, { height: parseFloat(v) })}
        />
        <Field
          label="Rotation (°)"
          value={door.rotation}
          type="number"
          onChange={(v) => updateDoor(door.id, { rotation: parseFloat(v) })}
        />
      </div>
    );
  }

  if (selected.type === "window") {
    const win = layout?.windows.find((w) => w.id === selected.id);
    if (!win) return null;
    return (
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-white">Window — {win.id}</h3>
        <Field
          label="Width (m)"
          value={win.width}
          type="number"
          onChange={(v) => updateWindow(win.id, { width: parseFloat(v) })}
        />
        <Field
          label="Height (m)"
          value={win.height}
          type="number"
          onChange={(v) => updateWindow(win.id, { height: parseFloat(v) })}
        />
        <Field
          label="Sill Height (m)"
          value={win.sill_height}
          type="number"
          onChange={(v) => updateWindow(win.id, { sill_height: parseFloat(v) })}
        />
      </div>
    );
  }

  if (selected.type === "room") {
    const room = layout?.rooms.find((r) => r.id === selected.id);
    if (!room) return null;
    return (
      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-white">Room — {room.name}</h3>
        <Field
          label="Name"
          value={room.name}
          onChange={(v) => updateRoom(room.id, { name: v })}
        />
        <Field
          label="Floor Material"
          value={room.floor_material}
          onChange={(v) => updateRoom(room.id, { floor_material: v })}
        />
        <Field
          label="Ceiling Height (m)"
          value={room.ceiling_height}
          type="number"
          onChange={(v) => updateRoom(room.id, { ceiling_height: parseFloat(v) })}
        />
      </div>
    );
  }

  return null;
}
