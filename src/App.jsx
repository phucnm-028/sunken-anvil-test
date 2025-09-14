import {Canvas} from "@react-three/fiber"
import {UI} from "./components/UI"
import {Experience} from "./components/Experience"


function App() {
    return (
        <>
        <UI />
        <Canvas
            camera={{
                position: [-1, -1, 5],
                fov: 45
            }}
        >

        <color attach="background" args={['#555']} />
        <fog attach="fog" args={['#555', 15, 25]} />
        <group position-y={-1}>
            <Experience />
        </group>
        </Canvas>
        </>
    )
}

export default App