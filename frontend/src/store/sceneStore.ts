import { create } from "zustand";
import type { LayoutJSON, SelectedElement, Wall, Door, Window, Room } from "@/types/scene";

interface SceneState {
  layout: LayoutJSON | null;
  bounding_box: [number, number, number, number] | null;
  drawingPreviewUrl: string | null;
  drawingFileName: string | null;
  selected: SelectedElement;
  isLoading: boolean;
  error: string | null;

  setScene: (layout: LayoutJSON, bbox: [number, number, number, number]) => void;
  setDrawingPreview: (url: string, fileName: string) => void;
  setSelected: (el: SelectedElement) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;

  updateWall: (id: string, patch: Partial<Wall>) => void;
  updateDoor: (id: string, patch: Partial<Door>) => void;
  updateWindow: (id: string, patch: Partial<Window>) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  layout: null,
  bounding_box: null,
  drawingPreviewUrl: null,
  drawingFileName: null,
  selected: null,
  isLoading: false,
  error: null,

  setScene: (layout, bbox) => set({ layout, bounding_box: bbox, error: null }),
  setDrawingPreview: (url, fileName) =>
    set({ drawingPreviewUrl: url, drawingFileName: fileName }),
  setSelected: (el) => set({ selected: el }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),

  updateWall: (id, patch) =>
    set((s) => {
      if (!s.layout) return {};
      return {
        layout: {
          ...s.layout,
          walls: s.layout.walls.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        },
      };
    }),

  updateDoor: (id, patch) =>
    set((s) => {
      if (!s.layout) return {};
      return {
        layout: {
          ...s.layout,
          doors: s.layout.doors.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        },
      };
    }),

  updateWindow: (id, patch) =>
    set((s) => {
      if (!s.layout) return {};
      return {
        layout: {
          ...s.layout,
          windows: s.layout.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        },
      };
    }),

  updateRoom: (id, patch) =>
    set((s) => {
      if (!s.layout) return {};
      return {
        layout: {
          ...s.layout,
          rooms: s.layout.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        },
      };
    }),
}));
