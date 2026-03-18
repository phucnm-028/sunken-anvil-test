import {Canvas} from "@react-three/fiber"
import {UI} from "./components/UI"
import {Experience} from "./components/Experience"
import { useConfiguratorStore } from "./store"

const NoAvatarOverlay = () => {
    const selectedProfile = useConfiguratorStore((s) => s.selectedProfile)
    if (selectedProfile) return null
  
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-1 bg-white/30 rounded-full" />
          <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
            Please select a race
          </p>
          <div className="w-16 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    )
  }

function App() {
    return (
        <>
        <UI />
        <NoAvatarOverlay />
        <Canvas
            camera={{
                position: [2, -0.7, 0],
                fov: 13
            }}
            gl={{ alpha: true }}
            style={{ background: 'transparent' }}
        >

        {/* <color attach="background" args={['#15293e']} /> */}
        {/* <fog attach="fog" args={['#555', 15, 25]} /> */}
        <group>
            <Experience />
        </group>
        </Canvas>
        </>
    )
}

export default App