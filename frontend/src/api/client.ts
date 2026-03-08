import type { LayoutJSON, SceneGeometry } from "@/types/scene";

const BASE = "/api";

export async function uploadDrawing(file: File): Promise<SceneGeometry> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload/`, { method: "POST", body: form });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail ?? "Upload failed");
  }
  return res.json();
}

export async function exportIfc(
  layout: LayoutJSON,
  projectName: string,
): Promise<Blob> {
  const res = await fetch(`${BASE}/export/ifc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, project_name: projectName }),
  });
  if (!res.ok) throw new Error("IFC export failed");
  return res.blob();
}
