import { useRef, useMemo, useEffect, useState, Suspense } from "react"
// TODO: Need to fix for poses - import { useAnimations } from "@react-three/drei"
import { useGLTF } from "@react-three/drei"
import { Asset } from "./Asset"
import { useConfiguratorStore } from "../store"

// ============================================================================
// BASE ASSET LOADER - Individual component to load each base part
// ============================================================================

const BaseAssetLoader = ({ url, bodyGroup, onLoad }) => {
  const { scene, animations } = useGLTF(url)

  useEffect(() => {
    if (scene) {
      onLoad(bodyGroup, scene, animations)
    }
  }, [scene, animations, bodyGroup, onLoad])

  return null // This component doesn't render anything
}

// ============================================================================
// AVATAR COMPONENT - Renders character with modular base parts + equipment
// ============================================================================

export const Avatar = ({ scale = 0.01, ...props }) => {
  const group = useRef()

  // Get state from store
  const {
    selectedProfile,
    baseAssets,
    equippedAssets,
    currentPose,
    poses,
  } = useConfiguratorStore()

  // Track which base assets have loaded
  const [loadedBases, setLoadedBases] = useState({
    head: null,
    torso: null,
    left_arm: null,
    right_arm: null,
    legs: null,
  })

  // Template skeleton state
  const [templateSkeleton, setTemplateSkeleton] = useState(null)
  const [templateBonesMap, setTemplateBonesMap] = useState(null)
  const [skeletonRoot, setSkeletonRoot] = useState(null)

  // TODO: Need to fix for poses - Animation state
  // const [animations, setAnimations] = useState([])

  // ============================================================================
  // HANDLE BASE ASSET LOADING
  // ============================================================================

  // Callback when a base asset loads
  const handleBaseAssetLoad = useMemo(
    () => (bodyGroup, scene, anims) => {
      setLoadedBases((prev) => ({
        ...prev,
        [bodyGroup]: scene,
      }))

      // Extract skeleton from first loaded asset (if not already extracted)
      setTemplateSkeleton((prevSkeleton) => {
        if (prevSkeleton) return prevSkeleton // Already have skeleton

        let skeleton = null
        scene.traverse((child) => {
          if (child.isSkinnedMesh && child.skeleton && !skeleton) {
            skeleton = child.skeleton

            // Create bones map for joint-order remapping
            const bonesMap = new Map()
            skeleton.bones.forEach((bone) => {
              bonesMap.set(bone.name, bone)
            })
            setTemplateBonesMap(bonesMap)

            // Set skeleton root (first bone in hierarchy)
            if (skeleton.bones.length > 0) {
              setSkeletonRoot(skeleton.bones[0])
            }

            // TODO: Need to store animations for pose system
            // setAnimations(anims || [])
          }
        })

        return skeleton
      })
    },
    []
  )

  //NOTE: move profile reset to Experience.jsx to avoid re-rendering the avatar when the profile changes.
  // Reset when profile changes
//   useEffect(() => {
//     // Always reset — whether clearing or switching profiles
//     setLoadedBases({
//       head: null,
//       torso: null,
//       left_arm: null,
//       right_arm: null,
//       legs: null,
//     })
//     setTemplateSkeleton(null)
//     setTemplateBonesMap(null)
//     setSkeletonRoot(null)

//     // TODO: Need to reactivate for poses
//     // setAnimations([])
// }, [selectedProfile])

  // // ============================================================================
  // // TODO: Need to reactivate for poses - POSE/ANIMATION SYSTEM
  // // ============================================================================

  // // Set up animation mixer and actions
  // const { mixer, clips } = useAnimations(animations, skeletonRoot)
  // const [actions, setActions] = useState({})

  // // Create actions from animation clips
  // useEffect(() => {
  //   if (!mixer || !clips?.length || !skeletonRoot) return

  //   const created = {}
  //   clips.forEach((clip) => {
  //     created[clip.name] = mixer.clipAction(clip, skeletonRoot)
  //   })
  //   setActions(created)

  //   // Cleanup
  //   return () => {
  //     Object.values(created).forEach((action) => action.stop())
  //   }
  // }, [mixer, clips, skeletonRoot])

  // // Play selected pose
  // useEffect(() => {
  //   if (!actions || Object.keys(actions).length === 0) return

  //   // Stop all actions
  //   Object.values(actions).forEach((action) => action.stop())

  //   // Play current pose if selected
  //   if (currentPose && poses.length > 0) {
  //     // Find pose object to get its slug/name
  //     const poseObj = poses.find((p) => p.id === currentPose)
  //     const poseName = poseObj?.slug || poseObj?.display_name

  //     if (poseName && actions[poseName]) {
  //       actions[poseName].reset().play()
  //     }
  //   }
  // }, [actions, currentPose, poses])

  // ============================================================================
  // RENDER BASE ASSETS
  // ============================================================================

  const renderBaseAssets = useMemo(() => {
    if (!templateSkeleton || !templateBonesMap) return null

    const bodyGroups = ['head', 'torso', 'left_arm', 'right_arm', 'legs']
    
    return bodyGroups.map((bodyGroup) => {
      const scene = loadedBases[bodyGroup]
      if (!scene) return null

      const meshes = []
      scene.traverse((child) => {
        if (child.isSkinnedMesh) {
          meshes.push({
            geometry: child.geometry,
            material: child.material,
            morphTargetDictionary: child.morphTargetDictionary,
            morphTargetInfluences: child.morphTargetInfluences,
          })
        }
      })

      return meshes.map((mesh, idx) => (
        <skinnedMesh
          key={`${bodyGroup}-${idx}`}
          geometry={mesh.geometry}
          material={mesh.material}
          skeleton={templateSkeleton}
          morphTargetDictionary={mesh.morphTargetDictionary}
          morphTargetInfluences={mesh.morphTargetInfluences}
          castShadow
          receiveShadow
        />
      ))
    })
  }, [loadedBases, templateSkeleton, templateBonesMap])

  // ============================================================================
  // RENDER EQUIPPED ASSETS
  // ============================================================================

  const equippedItems = useMemo(() => {
    if (!equippedAssets) return []

    const bodyGroups = ['head', 'torso', 'left_arm', 'right_arm', 'legs']
    const items = []

    bodyGroups.forEach((bodyGroup) => {
      const groupItems = equippedAssets[bodyGroup] || []
      groupItems.forEach((asset) => {
        if (asset?.file_url) {
          items.push({
            // Composite key: bodyGroup + asset.id ensures uniqueness even if
            // the same asset UUID could theoretically appear on different groups.
            key: `${bodyGroup}--${asset.id}`,
            asset,
          })
        }
      })
    })

    return items
  }, [equippedAssets])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Don't render anything if no profile selected
  if (!selectedProfile) {
    return null
  }

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Hidden loaders for base assets */}
      {baseAssets.head?.file_url && (
        <Suspense fallback={null}>
          <BaseAssetLoader
            url={baseAssets.head.file_url}
            bodyGroup="head"
            onLoad={handleBaseAssetLoad}
          />
        </Suspense>
      )}
      {baseAssets.torso?.file_url && (
        <Suspense fallback={null}>
          <BaseAssetLoader
            url={baseAssets.torso.file_url}
            bodyGroup="torso"
            onLoad={handleBaseAssetLoad}
          />
        </Suspense>
      )}
      {baseAssets.left_arm?.file_url && (
        <Suspense fallback={null}>
          <BaseAssetLoader
            url={baseAssets.left_arm.file_url}
            bodyGroup="left_arm"
            onLoad={handleBaseAssetLoad}
          />
        </Suspense>
      )}
      {baseAssets.right_arm?.file_url && (
        <Suspense fallback={null}>
          <BaseAssetLoader
            url={baseAssets.right_arm.file_url}
            bodyGroup="right_arm"
            onLoad={handleBaseAssetLoad}
          />
        </Suspense>
      )}
      {baseAssets.legs?.file_url && (
        <Suspense fallback={null}>
          <BaseAssetLoader
            url={baseAssets.legs.file_url}
            bodyGroup="legs"
            onLoad={handleBaseAssetLoad}
          />
        </Suspense>
      )}

     {/* Only render character if skeleton is ready */}
     {templateSkeleton && skeletonRoot && (
        <group name="Scene">
          <group 
            name="AvatarRoot"
            position={[0, 0, 0]}
            scale={scale}
          >
            {/* Skeleton root */}
            <primitive object={skeletonRoot} />

            {/* Render base assets (5 body parts) */}
            {renderBaseAssets}

            {/* Render equipped assets (equipment) — flat list for clean reconciliation */}
            {templateBonesMap && equippedItems.map(({ key, asset }) => (
              <Suspense key={key} fallback={null}>
                <Asset
                  url={asset.file_url}
                  templateBones={templateBonesMap}
                  skeleton={templateSkeleton}
                />
              </Suspense>
            ))}
          </group>
        </group>
      )}
    </group>
  )
}