import React, { useEffect } from "react"
import { useConfiguratorStore } from "../store"

// ============================================================================
// SPECIES SELECTOR
// ============================================================================

export const SpeciesSelector = () => {
  const { 
    species,
    selectedSpecies,
    profiles, 
    selectedProfile,
    selectProfile,
    selectSpecies,
  } = useConfiguratorStore()

  const allProfiles = [...profiles.male, ...profiles.female]

  return (
    <div className="flex flex-col gap-4">
      {/* ── Species Grid ── */}
      <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-3 flex flex-col">
        <h3 className="font-medium text-gray-700 text-sm">Species</h3>
        <div className="flex gap-2 flex-wrap">
          {species.map((sp) => {
            const isSelected = selectedSpecies === sp.id
            return (
              <button
                key={sp.id}
                onClick={() => selectSpecies(sp.id)}
                className={`w-20 h-20 rounded-md overflow-hidden bg-gray-200 pointer-events-auto 
                  hover:opacity-100 transition-all border-2 duration-500 flex items-center justify-center ${
                  isSelected
                    ? "border-indigo-500 opacity-100"
                    : "opacity-80 border-transparent"
                }`}
              >
                {sp.thumbnail_url ? (
                  <img 
                    src={sp.thumbnail_url} 
                    alt={sp.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600 text-center px-1">
                    {sp.display_name}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Profiles Grid (after species is selected) ── */}
      {selectedSpecies && allProfiles.length > 0 && (
        <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-3 flex flex-col">
          <h3 className="font-medium text-gray-700 text-sm">Profiles</h3>
          <div className="flex gap-2 flex-wrap">
            {allProfiles.map((profile) => {
              const isSelected = selectedProfile === profile.id
              const genderIcon = profile.male ? '♂' : '♀'
              const genderColor = profile.male ? 'text-blue-600' : 'text-pink-600'

              return (
                <button
                  key={profile.id}
                  onClick={() => selectProfile(profile.id)}
                  className={`w-20 h-20 rounded-md overflow-hidden bg-gray-200 pointer-events-auto 
                    hover:opacity-100 transition-all border-2 duration-500 relative ${
                    isSelected
                      ? "border-indigo-500 opacity-100"
                      : "opacity-80 border-transparent"
                  }`}
                >
                  {profile.thumbnail_url ? (
                    <img 
                      src={profile.thumbnail_url} 
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600 text-center px-1">
                      {profile.display_name}
                    </span>
                  )}
                  <span className={`absolute top-1 right-1 text-lg font-bold ${genderColor} drop-shadow-md`}>
                    {genderIcon}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// POSE SELECTOR
// ============================================================================

export const PoseSelector = () => {
  const { poses, currentPose, setPose, loadPoses } = useConfiguratorStore()

  // Load poses if not already loaded
  if (poses.length === 0) {
    loadPoses()
  }

  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-6 flex flex-col max-w-2xl">
      <h3 className="font-medium text-gray-700">Select Pose</h3>

      <div className="flex gap-2 flex-wrap">
        {poses.map((pose) => {
          const isSelected = currentPose === pose.id

          return (
            <button
              key={pose.id}
              onClick={() => setPose(isSelected ? null : pose.id)}
              className={`w-20 h-20 rounded-md overflow-hidden bg-gray-200 pointer-events-auto hover:opacity-100 transition-all border-2 duration-500 ${
                isSelected
                  ? "border-indigo-500 opacity-100"
                  : "opacity-80 border-transparent"
              }`}
            >
              {pose.thumbnail_url && (
                <img src={pose.thumbnail_url} alt={pose.display_name} />
              )}
              <span className="text-xs font-medium">{pose.display_name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// NO PROFILE SELECTED
// ============================================================================

export const NoProfileSelected = () => {
  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-4 flex flex-col items-center justify-center max-w-2xl">
      <div className="text-gray-400 text-6xl">👤</div>
      <h3 className="font-medium text-gray-700">No Profile Selected</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Select a profile from the <span className="font-medium">Species</span> category first
      </p>
    </div>
  )
}

// ============================================================================
// ALL ASSETS VERTICAL - Shows all slots and their assets (NO WRAPPER)
// ============================================================================

export const AllAssetsVertical = () => {
  const { 
    assetSlots,
    equippedAssets, 
    baseAssets,
    equipAsset,
    replaceBaseAsset,
  } = useConfiguratorStore()

  if (assetSlots.length === 0) {
    return (
      <div className="rounded-2xl bg-white drop-shadow-md p-6 max-w-3xl">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  // Return sections directly without wrapper - they'll stack naturally in parent
  return (
    <>
      {assetSlots.map((slot) => (
        <SlotWithAssets key={slot.id} slot={slot} />
      ))}
    </>
  )
}

// ============================================================================
// SLOT WITH ASSETS - One section showing slot name + all its assets
// ============================================================================

const SlotWithAssets = ({ slot }) => {
  const { 
    equippedAssets, 
    baseAssets,
    equipAsset,
    replaceBaseAsset,
    selectedProfile
  } = useConfiguratorStore()

  const [slotAssets, setSlotAssets] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const isBaseSlot = slot.is_base
  const assetGroup = slot.asset_group

  // ── Derive the armor_class_id for weapon-arm filtering ──
  // Only relevant when this slot is a weapon-arm slot (gear on an arm).
  // Reads from the equipped armor on THIS specific arm (left or right).
  const isWeaponArmSlot = 
    slot.main_category === 'gear' 
    && (assetGroup === 'left_arm' || assetGroup === 'right_arm')

  // Get the armor_class_id from whatever arm armor is currently on this arm
  const equippedOnThisArm = equippedAssets[assetGroup] || []
  const currentArmorPiece = equippedOnThisArm.find(
    a => a._mainCategory === 'clothing' && a.armor_class_id
  )
  // If no armor equipped, we'll look up 'bare' in the query
  const currentArmorClassId = currentArmorPiece?.armor_class_id || null

  // Load assets for this slot
  useEffect(() => {
    const loadAssets = async () => {
      if (!selectedProfile) return
      
      setLoading(true)
      try {
        const { getProfileById, getCompatibleAssets } = await import('./Catalog')
        const profile = await getProfileById(selectedProfile)
        
        // For weapon-arm slots, pass the armor class filter.
        // If no armor is equipped (currentArmorClassId is null),
        // look up the 'bare' armor class to filter by.
        let armorClassId = null

        if (isWeaponArmSlot) {
          if (currentArmorClassId) {
            armorClassId = currentArmorClassId
          } else {
            // No arm armor equipped — default to 'bare' weapon-arms.
            // Query the armor_classes table for the bare ID.
            const { supabase } = await import('./SupabaseClient')
            const { data: bareClass } = await supabase
              .from('armor_classes')
              .select('id')
              .eq('slug', 'bare')
              .single()
            armorClassId = bareClass?.id || null
          }
        }
        
        const assets = await getCompatibleAssets(slot.id, profile, armorClassId)
        setSlotAssets(assets)
      } catch (error) {
        console.error('Failed to load assets for slot:', slot.id, error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAssets()
  }, [slot.id, selectedProfile, currentArmorClassId])
  // ↑ Re-fetches when armor on THIS arm changes (armor_class_id changes)

  // Don't show section if loading or no assets
  if (loading || slotAssets.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-4 flex flex-col max-w-3xl">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">{slot.display_name}</h4>
        <span className="text-xs text-gray-500">
          {isBaseSlot ? "Base Part" : "Equipment"}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {slotAssets.map((asset) => {
          let isSelected = false
          
          if (isBaseSlot) {
            isSelected = baseAssets[assetGroup]?.id === asset.id
          } else {
            isSelected = equippedAssets[assetGroup]?.some(a => a.id === asset.id)
          }

          const handleClick = () => {
            if (isBaseSlot) {
              replaceBaseAsset(assetGroup, asset)
            } else {
              equipAsset(assetGroup, asset, slot)
            }
          }

          return (
            <button
              key={asset.id}
              onClick={handleClick}
              className={`w-20 h-20 rounded-md overflow-hidden bg-gray-200 pointer-events-auto hover:opacity-100 transition-all border-2 duration-500 ${
                isSelected
                  ? "border-indigo-500 opacity-100"
                  : "opacity-80 border-transparent"
              }`}
            >
              {asset.thumbnail_url && (
                <img 
                  src={asset.thumbnail_url} 
                  alt={asset.display_name}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}