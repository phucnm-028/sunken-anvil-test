import { useGLTF } from "@react-three/drei"
import { useMemo, useEffect, useRef } from "react"
import { Skeleton } from "three"

/**
 * Asset component that loads a GLB and binds it to a template skeleton
 * with proper joint-order remapping.
 * 
 * CRITICAL: Joint-order remapping is necessary because different GLB files
 * can have identical bone names but different joint ordering. Without remapping,
 * parts will "explode" or freeze during animation.
 * 
 * @param {string} url - Supabase Storage URL for the GLB file
 * @param {Map<string, Bone>} templateBones - Map of bone name → template bone object
 * @param {Skeleton} skeleton - Template skeleton (optional, for reference)
 */
export const Asset = ({ url, templateBones, skeleton }) => {
  const { scene } = useGLTF(url)

  // Track created skeletons for cleanup on unmount
  const createdSkeletonsRef = useRef([])
  
  const remappedMeshes = useMemo(() => {

   // Dispose any previously created skeletons before computing new ones
   createdSkeletonsRef.current.forEach(s => s.dispose())
   createdSkeletonsRef.current = []  
    if (!templateBones) {
      // Fallback: no remapping (will likely break with animation)
      console.warn(`Asset "${url}": No templateBones provided, skipping joint-order remapping`)
      const meshes = []
      scene.traverse((child) => {
        if (child.isSkinnedMesh) {
          meshes.push({
            geometry: child.geometry,
            material: child.material,
            skeleton: skeleton || child.skeleton,
            morphTargetDictionary: child.morphTargetDictionary,
            morphTargetInfluences: child.morphTargetInfluences,
          })
        }
      })
      return meshes
    }

    const meshes = []
    
    scene.traverse((child) => {
      if (child.isSkinnedMesh) {
        // Get the part's original bone order (this is what the mesh expects)
        const partBones = child.skeleton.bones
        const partBoneInverses = child.skeleton.boneInverses
        
        // Remap: create bones array in PART's order using TEMPLATE's bone objects
        const remappedBones = partBones.map((partBone, index) => {
          const templateBone = templateBones.get(partBone.name)
          if (!templateBone) {
            console.warn(`Asset "${url}": Bone "${partBone.name}" not found in template skeleton`)
            return partBone // Fallback - will break animation but visible
          }
          return templateBone
        })
        
       // Create new skeleton with remapped bones but ORIGINAL inverses
        // Inverses must stay in part's order because they match part's bind pose
        const remappedSkeleton = new Skeleton(remappedBones, partBoneInverses)
        createdSkeletonsRef.current.push(remappedSkeleton)
        
        meshes.push({
          geometry: child.geometry,
          material: child.material,
          skeleton: remappedSkeleton,
          morphTargetDictionary: child.morphTargetDictionary,
          morphTargetInfluences: child.morphTargetInfluences,
        })
      }
    })
    
    return meshes
  }, [scene, templateBones, skeleton, url])
  
  // Cleanup: dispose created skeletons when this Asset unmounts
  useEffect(() => {
    return () => {
      createdSkeletonsRef.current.forEach(s => s.dispose())
      createdSkeletonsRef.current = []
    }
  }, [])
  return (
    <>
      {remappedMeshes.map((mesh, index) => (
        <skinnedMesh
          key={`${url}-${index}`}
          frustumCulled={false}
          geometry={mesh.geometry}
          material={mesh.material}
          skeleton={mesh.skeleton}
          morphTargetDictionary={mesh.morphTargetDictionary}
          morphTargetInfluences={mesh.morphTargetInfluences}
          castShadow
          receiveShadow
        />
      ))}
    </>
  )
}