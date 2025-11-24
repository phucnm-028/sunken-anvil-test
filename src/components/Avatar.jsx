import { useRef, useMemo, useEffect, useState, Suspense } from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import { Asset } from "./Asset"
import { useConfiguratorStore, pb } from "../store"

// Extract body for skinnedMesh, skeleton to skin assets and hips for armature root
const extractAvatarElements = (scene) => {
  const meshes = []
  let skeleton = null

  scene.traverse((child) => {
    if (child.isSkinnedMesh) {
      meshes.push(child)
      // console.log('child.name', child.name)
      // console.log('child.skeleton', child.skeleton)
      // console.log('skeleton', skeleton)
      if (!skeleton) skeleton = child.skeleton
    }
  })
  return {meshes, skeleton}
}

// Export Avatar component, to be used in Experience comp
export const Avatar=({...props})=>{

    const group = useRef()

    // Docs for scene and nodes
    //https://github.khronos.org/glTF-Tutorials/gltfTutorial/gltfTutorial_003_MinimalGltfFile.html
    const { nodes, scene, animations } = useGLTF('/models/drakona_F_211125_wip.glb')
    const customization = useConfiguratorStore((state) => state.customization)

    // extract meshes and get the first skeleton found.
    // NOTE: Assuming in the hierarchy the armature is the first child in the scene.
    // TODO: need to add check that armature is the frist child.
    const { meshes, skeleton } = useMemo(() => {
      return extractAvatarElements(scene)
    }, [scene])

    // Caching the skeleton.
    const skeletonRoot = useMemo(() => {
      if (!skeleton) return null
      return skeleton.bones[0]        // actual root bone
    }, [skeleton])

    // extract actions, each action a pose from NLA tracks
    const { mixer, clips } = useAnimations(animations, skeletonRoot)
    const currentPose = useConfiguratorStore((state) => state.currentPose)

    // Create a state to hold the actual actions (bc useAnimations doesn't create them automatically)
    const [actions, setActions] = useState({})

    // Create actions and return animation mixer, clips and skeleton root
    useEffect(() => {
      if (!mixer || !clips?.length || !skeletonRoot) return

      // object to hold actions
      const created = {}
      clips.forEach((clip) => {
        created[clip.name] = mixer.clipAction(clip, skeletonRoot)
      })
      setActions(created)

      // debuggin
      // if (typeof window !== "undefined") {
      //   window.actions = created
      //   window.clips = clips
      //   window.skeletonRoot = skeletonRoot
      // }
    }, [mixer, clips, skeletonRoot])


    // Play pose.
    useEffect(() => {
      if (!actions || Object.keys(actions).length === 0) return

      // hold actions to ensure only one action at a time
      Object.values(actions).forEach((a) => a.stop())
      // play the current pose
      if (currentPose && actions[currentPose]) {
        actions[currentPose].reset().play()
      }
    }, [actions, currentPose])

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group 
          name="AvatarRoot"
          position={[0, 0, 0]}
          scale={0.08}
        >

          {/* Skeleton root */}
          {skeletonRoot && <primitive object={skeletonRoot} />}

          {/* Render ALL skinned meshes, unified on ONE skeleton*/}
          {meshes.map((mesh, i) => (
            <skinnedMesh
              key={i}
              geometry={mesh.geometry}
              material={mesh.material}
              skeleton={skeleton}     // unified skeleton
              castShadow
              receiveShadow
            />
          ))}

          {/* customization assets (e.g. clothes, etc...) */}
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