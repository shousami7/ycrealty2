export interface Wall {
  id: string;
  start: [number, number];
  end: [number, number];
  thickness: number;
  height: number;
  material: string;
}

export interface Door {
  id: string;
  position: [number, number];
  width: number;
  height: number;
  rotation: number;
  wall_id: string | null;
}

export interface Window {
  id: string;
  position: [number, number];
  width: number;
  height: number;
  sill_height: number;
  wall_id: string | null;
}

export interface Room {
  id: string;
  name: string;
  polygon: [number, number][];
  floor_material: string;
  ceiling_height: number;
}

export interface LayoutJSON {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  scale_meters_per_pixel: number | null;
}

export interface SceneGeometry {
  layout: LayoutJSON;
  bounding_box: [number, number, number, number];
}

export type SelectedElement =
  | { type: "wall"; id: string }
  | { type: "door"; id: string }
  | { type: "window"; id: string }
  | { type: "room"; id: string }
  | null;
