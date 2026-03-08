import * as THREE from "three";
import { type ThreeEvent } from "@react-three/fiber";
import type { Room } from "@/types/scene";
import { useSceneStore } from "@/store/sceneStore";

interface Props {
  room: Room;
}

const FLOOR_COLORS: Record<string, string> = {
  wood: "#c9a97a",
  concrete: "#b0b0b0",
  tile: "#d0d0d0",
  carpet: "#8b7355",
  default: "#c0b090",
};

export function FloorMesh({ room }: Props) {
  const selected = useSceneStore((s) => s.selected);
  const setSelected = useSceneStore((s) => s.setSelected);
  const isSelected = selected?.type === "room" && selected.id === room.id;

  if (room.polygon.length < 3) return null;

  const shape = new THREE.Shape();
  shape.moveTo(room.polygon[0][0], room.polygon[0][1]);
  for (let i = 1; i < room.polygon.length; i++) {
    shape.lineTo(room.polygon[i][0], room.polygon[i][1]);
  }
  shape.closePath();

  const color = FLOOR_COLORS[room.floor_material] ?? FLOOR_COLORS.default;

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    setSelected({ type: "room", id: room.id });
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      receiveShadow
    >
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={isSelected ? "#60a5fa" : color}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
