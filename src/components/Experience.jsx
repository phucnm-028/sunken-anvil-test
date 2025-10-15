import { OrbitControls, Environment, Backdrop , Grid, Bounds} from "@react-three/drei"
import { Avatar } from "./Avatar"
// import { Backdrop } from "./Backdrop"

function SceneGizmos() {
    return (
      <>
        {/* 1 unit ≈ 1 meter */}
        <Grid
          position={[0, 0, 0]}
          infiniteGrid
          cellSize={1}       // 1 m cells
          sectionSize={5}    // thicker line every 5 m
          cellThickness={0.5}
          sectionThickness={1}
          fadeDistance={40}
          fadeStrength={1}
        />
        {/* Axis at the origin: X red, Y green, Z blue */}
        <axesHelper args={[1]} />
  
        {/* 1 m calibration cube sitting on the “floor” */}
        <mesh position={[0.5, 0.5, 0.5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial wireframe />
        </mesh>
      </>
    )
  }  

export const Experience = () => {
    return (
    <>
    <OrbitControls
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
    />
    <Environment preset="sunset" environmentIntensity={0.8} />

    {/* <Backdrop scale={[50,10, 5]} floor={1.5} receiveShadow position-z={-4}>
        <meshStandardMaterial color="#555" />
    </Backdrop> */}
        
    {/* Key Light */}
    <directionalLight
        position={[5, 5, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
    />
    {/* Fill Light */}
     <directionalLight position={[-5, 5, 5]} intensity={0.7} />
    {/* Back Lights */}
    {/* <directionalLight position={[1, 0.1, -5]} intensity={3} color={"red"} />
    <directionalLight position={[-1, 0.1, -5]} intensity={3} color={"blue"} /> */}

    <Grid position={[0,0,0]} infiniteGrid cellSize={1} sectionSize={5} />
    <axesHelper args={[1]} />

    <Bounds fit clip margin={26}>
        <Avatar />
    </Bounds>
    
    </>
    )
}
