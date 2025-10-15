import { useRef, useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { Asset } from "./Asset"
import { useConfiguratorStore, pb } from "../store"
import { Suspense } from "react"        

export const Avatar=({...props})=>{
    const group = useRef()
    // const { nodes} = useGLTF('/models/Armature.glb')
    const { nodes, scene} = useGLTF('/models/tmp_armature_pose_3.glb')
    const customization = useConfiguratorStore((state) => state.customization)
    // const { actions } = useAnimations(animations, group) 
    
    // In Avatar.jsx, add these logs:
    // console.log("Customization keys:", Object.keys(customization));
    console.log("Available nodes:", nodes);
    // console.log("Plane exists:", !!nodes.Plane);
    // console.log("Plane skeleton exists:", !!nodes.Plane?.skeleton);
    
    const {body, skeleton, hips} = useMemo(() => {
      let body = nodes.Plane ?? nodes.Body001 ?? null
      let skeleton = body?.skeleton ?? null
      let hips = nodes.Hips001 ?? nodes.mixamorigHips ?? null

      if (!skeleton) {
        scene.traverse((child) => {
          if (!skeleton && child.isSkinnedMesh && child.skeleton) {
            body = child
            skeleton = child.skeleton
          }

          if (!hips && child.isBone && /Hips/i.test(child.name)) {
            hips = child
          }
        })
      }
      return {body, skeleton, hips}
    }, [nodes, scene])

    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group 
            name="Armature"  
            position={[0,0,0]} 
            // rotation={[Math.PI / 2, 0, 0]} 
            scale={0.08}
          >
          {hips && <primitive object={hips} />}

            {body && (
              <skinnedMesh
                geometry={body.geometry}
                material={body.material}
                skeleton={body.skeleton}
                castShadow
                receiveShadow
              />
            )}

            {/* Armature */}
            {/* <primitive object={nodes.Hips001 ? nodes.Hips001 : nodes.mixamorigHips} />
             */}
             {/* {Object.keys(customization).map(
                (key) => 
                    customization[key]?.asset?.url && (
                        <Suspense key={customization[key].asset.id}>
                            <Asset 
                                categoryName={key}
                                url={pb.files.getURL(
                                    customization[key].asset,
                                    customization[key].asset.url
                                )}
                                skeleton={
                                  nodes.Plane ? nodes.Plane.skeleton : nodes.Body001.skeleton
                                }
                            />
                        </Suspense>
                    )
                )} */}
          
            {Object.keys(customization).map((key) => {
              const file =
                customization[key]?.asset &&
                pb.files.getURL(
                  customization[key].asset,
                  customization[key].asset.url
                )
              return file ? (
                <Suspense key={customization[key].asset.id}>
                  <Asset
                    categoryName={key}
                    url={file}
                    skeleton={skeleton}
                  />
                </Suspense>
              ) : null
            })}
          
          
          
          </group>
        </group>
      </group>
    )
}

