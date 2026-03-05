import {Canvas} from "@react-three/fiber"
import {UI} from "./components/UI"
import {Experience} from "./components/Experience"


function App() {
    return (
        <>
        <UI />
        <Canvas
            camera={{
                position: [2, -0.7, 0],
                fov: 13
            }}
        >

        <color attach="background" args={['#555']} />
        {/* <fog attach="fog" args={['#555', 15, 25]} /> */}
        <group>
            <Experience />
        </group>
        </Canvas>
        </>
    )
}

export default App