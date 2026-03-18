import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Avatar } from "./Avatar"
import { useConfiguratorStore } from "../store"
import * as THREE from "three"


// Default and zoomed-out camera positions
const CAM_DEFAULT = new THREE.Vector3(2, -0.7, 0)
const CAM_ZOOMED_OUT = new THREE.Vector3(2.2, -0.2, 0)  // pulls back along X
const LERP_SPEED = 4  // smooth transition speed


export const Experience = () => {
  const selectedProfile = useConfiguratorStore((s) => s.selectedProfile)
  // const currentMainCategory = useConfiguratorStore((s) => s.currentMainCategory)
  const mobileDrawerOpen = useConfiguratorStore((s) => s.mobileDrawerOpen)
  const controlsRef = useRef()
  const { gl } = useThree()


  // Check if we're on a mobile-width viewport
  const isMobile = gl.domElement.clientWidth < 768

  const isAnimating = useRef(false)
  const prevDrawerOpen = useRef(false)

  useFrame((state, delta) => {
    if (!isMobile) return
  
    // Detect drawer state change → start animating
    if (mobileDrawerOpen !== prevDrawerOpen.current) {
      prevDrawerOpen.current = mobileDrawerOpen
      isAnimating.current = true
    }
  
    if (!isAnimating.current) return
  
    const target = mobileDrawerOpen ? CAM_ZOOMED_OUT : CAM_DEFAULT
    state.camera.position.lerp(target, 1 - Math.exp(-LERP_SPEED * delta))
    state.camera.updateProjectionMatrix()
  
    // Stop animating once we're close enough
    if (state.camera.position.distanceTo(target) < 0.01) {
      state.camera.position.copy(target)
      isAnimating.current = false
    }
  
    if (controlsRef.current) controlsRef.current.update()
  })
  // const panelOpen = selectedProfile && currentMainCategory !== 'species'
  return (
    <>
      <OrbitControls
        // target={panelOpen ? [-0.5, 0, 0] : [0, 0, 0]}
        ref={controlsRef}
        target={[-0.5, -1, 0]}
        enablePan={false}
        
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
      />
      <Environment preset="sunset" environmentIntensity={0.35} />
        
      {/* Key Light */}
      <directionalLight
        position={[0, 0, 0]}
        intensity={0.01}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <directionalLight position={[1, 0.1, -5]} intensity={0.2} color={"red"} />
      <directionalLight position={[-1, 0.1, -5]} intensity={4} color={"#001a33"} />

      {/* Avatar with adjustable scale */}
      
      <group position={[-0.5, -1, 0]}>
        <Avatar scale={0.01} key={selectedProfile} />
      </group>
    </>
  )
}