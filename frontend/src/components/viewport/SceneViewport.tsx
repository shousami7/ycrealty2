import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { useSceneStore } from "@/store/sceneStore";
import { WallMesh } from "./WallMesh";
import { FloorMesh } from "./FloorMesh";

export function SceneViewport() {
  const layout = useSceneStore((s) => s.layout);
  const bbox = useSceneStore((s) => s.bounding_box);
  const setSelected = useSceneStore((s) => s.setSelected);

  // Center camera over the floor plan
  const centerX = bbox ? (bbox[0] + bbox[2]) / 2 : 0;
  const centerZ = bbox ? (bbox[1] + bbox[3]) / 2 : 0;
  const span = bbox ? Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]) : 20;
  const camY = span * 0.8;

  return (
    <Canvas
      shadows
      camera={{ position: [centerX, camY, centerZ + span], fov: 50 }}
      className="w-full h-full"
      onPointerMissed={() => setSelected(null)}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Environment preset="city" />

      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        cellColor="#333"
        sectionColor="#555"
        fadeDistance={80}
        position={[0, -0.01, 0]}
      />

      {layout?.walls.map((w) => <WallMesh key={w.id} wall={w} />)}
      {layout?.rooms.map((r) => <FloorMesh key={r.id} room={r} />)}

      <OrbitControls
        makeDefault
        target={[centerX, 0, centerZ]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
