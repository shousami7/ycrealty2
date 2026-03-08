import { useRef } from "react";
import * as THREE from "three";
import { type ThreeEvent } from "@react-three/fiber";
import type { Wall } from "@/types/scene";
import { useSceneStore } from "@/store/sceneStore";

interface Props {
  wall: Wall;
}

const MATERIAL_COLORS: Record<string, string> = {
  concrete: "#8a8a8a",
  brick: "#c87941",
  wood: "#a0784b",
  glass: "#a8d8f0",
  default: "#9a9a9a",
};

export function WallMesh({ wall }: Props) {
  const selected = useSceneStore((s) => s.selected);
  const setSelected = useSceneStore((s) => s.setSelected);
  const isSelected = selected?.type === "wall" && selected.id === wall.id;

  const dx = wall.end[0] - wall.start[0];
  const dy = wall.end[1] - wall.start[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const cx = (wall.start[0] + wall.end[0]) / 2;
  const cy = (wall.start[1] + wall.end[1]) / 2;

  const color = MATERIAL_COLORS[wall.material] ?? MATERIAL_COLORS.default;

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    setSelected({ type: "wall", id: wall.id });
  }

  return (
    <mesh
      position={[cx, wall.height / 2, cy]}
      rotation={[0, -angle, 0]}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, wall.height, wall.thickness]} />
      <meshStandardMaterial
        color={isSelected ? "#3b82f6" : color}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}
