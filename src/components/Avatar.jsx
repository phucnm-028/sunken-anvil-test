import { useRef } from "react"
import { useGLTF } from "@react-three/drei"
import { Asset } from "./Asset"
import { useConfiguratorStore, pb } from "../store"
import { Suspense } from "react"        

export const Avatar=({...props})=>{
    const group = useRef()
    const { nodes} = useGLTF('/models/Armature.glb')
    const customization = useConfiguratorStore((state) => state.customization)
    // const { actions } = useAnimations(animations, group) 
    
    // In Avatar.jsx, add these logs:
    // console.log("Customization keys:", Object.keys(customization));
    console.log("Available nodes:", nodes);
    // console.log("Plane exists:", !!nodes.Plane);
    // console.log("Plane skeleton exists:", !!nodes.Plane?.skeleton);
    
    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <primitive object={nodes.mixamorigHips} />
             {Object.keys(customization).map(
                (key) => 
                    customization[key]?.asset?.url && (
                        <Suspense key={customization[key].asset.id}>
                            <Asset 
                                categoryName={key}
                                url={pb.files.getUrl(
                                    customization[key].asset,
                                    customization[key].asset.url
                                )}
                                skeleton={nodes.Plane.skeleton}
                            />
                        </Suspense>
                    )
                )}
          </group>
        </group>
      </group>
    )
}