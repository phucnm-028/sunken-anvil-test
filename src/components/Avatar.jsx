import { useRef, useMemo, useEffect, useState } from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import { Asset } from "./Asset"
import { useConfiguratorStore, pb } from "../store"
import { Suspense } from "react"        

// Extract body for skinnedMesh, skeleton to skin assets and hips for armature root
const extractAvatarElements = (nodes, scene) => {
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
}

export const Avatar=({...props})=>{

    const group = useRef()

    // Docs for scene and nodes
    //https://github.khronos.org/glTF-Tutorials/gltfTutorial/gltfTutorial_003_MinimalGltfFile.html
    const { nodes, scene, animations } = useGLTF('/models/template_271025_2pose.glb')
    const customization = useConfiguratorStore((state) => state.customization)

    // Memoize body, skeleton, and hips when nodes and scene change
    const {body, skeleton, hips} = useMemo(() => {
      return extractAvatarElements(nodes, scene)
    }, [nodes, scene])

    // extract actions, each action a pose from NLA tracks
    const { ref, mixer, names, actions: initialActions, clips } = useAnimations(animations, group)
    const currentPose = useConfiguratorStore((state) => state.currentPose)
    
    // Create a state to hold the actual actions (since useAnimations doesn't create them automatically)
    const [actions, setActions] = useState({})

    // Manually create actions after the ref is attached
    useEffect(() => {
      const createActions = () => {
        if (!group.current || !mixer || !clips || clips.length === 0) return false

        // Create actions for each clip
        const createdActions = {}
        clips.forEach((clip) => {
          const action = mixer.clipAction(clip, group.current)
          createdActions[clip.name] = action
        })

        setActions(createdActions)
        
        // Verification logging
        console.log('✅ Actions created:', Object.keys(createdActions))
        console.log('✅ Total actions:', Object.keys(createdActions).length)
        console.log('✅ Actions object:', createdActions)
        
        // Expose to window for debugging
        if (typeof window !== 'undefined') {
          window.createdActions = createdActions
        }
        return true
      }

      // Try immediately
      if (!createActions()) {
        // Retry after a short delay if ref isn't ready yet
        const timeout = setTimeout(() => {
          createActions()
        }, 100)
        return () => clearTimeout(timeout)
      }
    }, [mixer, clips])

    // Browset terminal debug
    if (typeof window !== 'undefined') {
      window.groupRef = group
      window.useGLTFResult = { nodes, scene, animations }
      window.useAnimationsResult = { ref, mixer, names, actions: initialActions, clips }
      console.log('useGLTF and useAnimation result exposed to window.useGLTFResult', 
        { nodes, scene, animations, ref, mixer, names, actions: initialActions, clips })
  }

    // Switch poses only when currentPose changes (via thumbnail clicks)
    useEffect(() => {
      if (!actions || Object.keys(actions).length === 0) return
      
      // Only play if currentPose is explicitly set (not null/undefined)
      if (currentPose && actions[currentPose]) {
        // Stop everything first
        Object.values(actions).forEach(a => a.stop())
        
        // Play the selected pose
        actions[currentPose].reset().play()
        console.log('✅ Playing pose:', currentPose)
      } else {
        // If no pose is selected, stop all animations
        Object.values(actions).forEach(a => a.stop())
      }
    }, [actions, currentPose])


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

