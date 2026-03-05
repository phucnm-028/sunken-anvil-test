import { OrbitControls, Environment } from "@react-three/drei"
import { Avatar } from "./Avatar"
import { useConfiguratorStore } from "../store"

export const Experience = () => {
  const selectedProfile = useConfiguratorStore((s) => s.selectedProfile)
  const currentMainCategory = useConfiguratorStore((s) => s.currentMainCategory)

  // const panelOpen = selectedProfile && currentMainCategory !== 'species'
  return (
    <>
      <OrbitControls
        // target={panelOpen ? [-0.5, 0, 0] : [0, 0, 0]}
        target={[-0.5, -1, 0]}
        enablePan={false}
        
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
      />
      <Environment preset="sunset" environmentIntensity={0.8} />
        
      {/* Key Light */}
      <directionalLight
        position={[0, 0, 0]}
        intensity={0.01}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <directionalLight position={[1, 0.1, -5]} intensity={0.1} color={"red"} />
      <directionalLight position={[-1, 0.1, -5]} intensity={0.1} color={"blue"} />

      {/* Avatar with adjustable scale */}
      
      <group position={[-0.5, -1, 0]}>
        <Avatar scale={0.01} key={selectedProfile} />
      </group>
    </>
  )
}