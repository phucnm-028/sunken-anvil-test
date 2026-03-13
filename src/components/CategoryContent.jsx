import React, { useEffect } from "react"
import { useConfiguratorStore } from "../store"


// ============================================================================
// SPECIES SELECTOR
// ============================================================================
 
// ── ProfileThumb ─────────────────────────────────────────────────────────────
// Single male or female thumbnail cell inside a species row.
 
const ProfileThumb = ({ profile, isMale, isSelected, onSelect }) => {
  const genderIcon  = isMale ? "♂" : "♀"
  const genderColor = isMale ? "text-blue-500" : "text-rose-400"
  const genderLabel = isMale ? "Male" : "Female"
 
  if (!profile) {
    // Empty placeholder — keeps the grid aligned when one gender has no profile
    return <div className="w-full aspect-square rounded-md bg-gray-50 border-2 border-transparent" />
  }
 
  return (
    <button
      onClick={onSelect}
      title={`${profile.display_name} — ${genderLabel}`}
      className={`w-full aspect-square rounded-md overflow-hidden bg-gray-100 pointer-events-auto
        transition-all border-2 duration-300 relative flex items-center justify-center ${
        isSelected
          ? "border-indigo-500 opacity-100"
          : "opacity-70 border-transparent hover:opacity-90"
      }`}
    >
      {profile.thumbnail_url ? (
        <>
          <img
            src={profile.thumbnail_url}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
          {/* Gender badge overlay — only when thumbnail present */}
          <span className={`absolute top-1 right-1 text-sm font-bold ${genderColor} drop-shadow`}>
            {genderIcon}
          </span>
        </>
      ) : (
        // No thumbnail — show name + gender symbol as text
        <div className="flex flex-col items-center gap-0.5 px-1">
          <span className={`text-lg font-bold leading-none ${genderColor}`}>{genderIcon}</span>
          <span className="text-xs font-semibold text-gray-600 text-center leading-tight">
            {profile.display_name}
          </span>
        </div>
      )}
    </button>
  )
}
 
// ── SpeciesSelector ───────────────────────────────────────────────────────────
 
export const SpeciesSelector = () => {
  const {
    species,
    selectedProfile,
    selectSpecies,
    selectProfile,
  } = useConfiguratorStore()
 
  // Local map: speciesId → { male: Profile|null, female: Profile|null }
  const [profileMap, setProfileMap] = React.useState({})
 
  // Pre-fetch profiles for every species once the species list is available
  useEffect(() => {
    if (species.length === 0) return
 
    const loadAll = async () => {
      const { getProfilesBySpecies } = await import('./Catalog')
      const entries = await Promise.all(
        species.map(async (sp) => {
          const grouped = await getProfilesBySpecies(sp.id)
          return [
            sp.id,
            {
              male:   grouped.male[0]   ?? null,
              female: grouped.female[0] ?? null,
            }
          ]
        })
      )
      setProfileMap(Object.fromEntries(entries))
    }
 
    loadAll()
  }, [species])
 
  const handleSelect = (speciesId, profile) => {
    selectSpecies(speciesId)   // updates store.selectedSpecies + fetches full profile list
    selectProfile(profile.id)  // updates store.selectedProfile + loads base assets
  }
 
  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-4 flex flex-col gap-2">
      {species.map((sp) => {
        const entry         = profileMap[sp.id]
        const maleProfile   = entry?.male   ?? null
        const femaleProfile = entry?.female ?? null
 
        const rowActive =
          (maleProfile   && selectedProfile === maleProfile.id) ||
          (femaleProfile && selectedProfile === femaleProfile.id)
 
        return (
          <div key={sp.id} className={`flex flex-col gap-1 p-2 rounded-xl transition-colors duration-200 ${
            rowActive ? "bg-indigo-50" : "hover:bg-gray-50"
          }`}>
            {/* Species name */}
            <span className={`text-xs font-medium ${
              rowActive ? "text-indigo-600" : "text-gray-500"
            }`}>
              {sp.display_name}
            </span>
 
            {/* Two thumbnails — fixed equal size */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <ProfileThumb
                profile={maleProfile}
                isMale={true}
                isSelected={selectedProfile === maleProfile?.id}
                onSelect={() => maleProfile && handleSelect(sp.id, maleProfile)}
              />
              <ProfileThumb
                profile={femaleProfile}
                isMale={false}
                isSelected={selectedProfile === femaleProfile?.id}
                onSelect={() => femaleProfile && handleSelect(sp.id, femaleProfile)}
              />
            </div>
          </div>
        )
      })}
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
  const isWeaponArmSlot = 
    slot.main_category === 'gear' 
    && (assetGroup === 'left_arm' || assetGroup === 'right_arm')

  const equippedOnThisArm = equippedAssets[assetGroup] || []
  const currentArmorPiece = equippedOnThisArm.find(
    a => a._mainCategory === 'clothing' && a.armor_class_id
  )
  const currentArmorClassId = currentArmorPiece?.armor_class_id || null

  // ── Derive species filter for legs equipment slots ──
  // If this is a legs equipment slot, check what base legs are equipped.
  // Shared legs (species_id = null) → show only shared leg armor
  // Species-specific legs (e.g. Drakona) → show only that species' leg armor
  const isLegsEquipmentSlot = !isBaseSlot && assetGroup === 'legs'
  const baseLegsSpeciesId = isLegsEquipmentSlot
    ? (baseAssets.legs?.species_id ?? null)  // null if shared, uuid if species-specific
    : undefined  // undefined = not a legs slot, use default filtering

  // Load assets for this slot
  useEffect(() => {
    const loadAssets = async () => {
      if (!selectedProfile) return
      
      setLoading(true)
      try {
        const { getProfileById, getCompatibleAssets } = await import('./Catalog')
        const profile = await getProfileById(selectedProfile)
        
        let armorClassId = null

        if (isWeaponArmSlot) {
          if (currentArmorClassId) {
            armorClassId = currentArmorClassId
          } else {
            const { supabase } = await import('./SupabaseClient')
            const { data: bareClass } = await supabase
              .from('armor_classes')
              .select('id')
              .eq('slug', 'bare')
              .single()
            armorClassId = bareClass?.id || null
          }
        }
        
        const assets = await getCompatibleAssets(slot.id, profile, armorClassId, baseLegsSpeciesId)

        console.log(`[SlotWithAssets] slot="${slot.display_name}" (${slot.slug})`, {
          assetGroup,
          isLegsEquipmentSlot,
          baseLegsSpeciesId,
          armorClassId,
          profile: {
            rig_class: profile.rig_class,
            thickness: profile.thickness,
            species_id: profile.species_id,
          },
          results: assets.map(a => ({
            sku: a.sku,
            display_name: a.display_name,
            species_id: a.species_id,
            file_url: a.file_url,
          })),
        })
        
        setSlotAssets(assets)
      } catch (error) {
        console.error('Failed to load assets for slot:', slot.id, error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAssets()
  }, [slot.id, selectedProfile, currentArmorClassId, baseLegsSpeciesId])
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