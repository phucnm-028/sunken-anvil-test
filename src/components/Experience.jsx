import { OrbitControls, Environment } from "@react-three/drei"
import { Avatar } from "./Avatar"

export const Experience = () => {
  return (
    <>
      <OrbitControls
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
      />
      <Environment preset="sunset" environmentIntensity={0.8} />
        
      {/* Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.01}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <directionalLight position={[1, 0.1, -5]} intensity={0.1} color={"red"} />
      <directionalLight position={[-1, 0.1, -5]} intensity={0.1} color={"blue"} />

      {/* Avatar with adjustable scale */}
      <Avatar scale={0.001} />
    </>
  )
}