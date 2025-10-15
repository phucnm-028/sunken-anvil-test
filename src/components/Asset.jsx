import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";

export const Asset = ({url, skeleton}) => {
    const {scene} = useGLTF(url);
    
    const attachedItems = useMemo(() => {
        const items = [];
        scene.traverse((child) => {

            // console.log(
            //     child.name,
            //     'isSkinned?', child.isSkinnedMesh,
            //     'has skin attrs?', !!child.geometry?.attributes?.skinIndex
            //   );
              
            if (child.isMesh) {
                items.push({
                    geometry: child.geometry,
                    material: child.material,
                    morphTargetDictionary: child.morphTargetDictionary,
                    morphTargetInfluences: child.morphTargetInfluences,
                });
            }
        });
        return items;
    }, [scene]); 
    
    return attachedItems.map((item, index) => (
        <skinnedMesh
            key={index}
            geometry={item.geometry}
            material={item.material}
            skeleton={skeleton} 
            morphTargetDictionary={item.morphTargetDictionary}
            morphTargetInfluences={item.morphTargetInfluences}
            castShadow
            receiveShadow
        />
    ));
}