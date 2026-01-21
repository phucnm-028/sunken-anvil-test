import React, { useEffect } from "react"
import { useConfiguratorStore } from "../store"

// ============================================================================
// SPECIES SELECTOR
// ============================================================================

export const SpeciesSelector = () => {
  const { 
    species,
    profiles, 
    selectedProfile,
    selectProfile,
    loadSpecies
  } = useConfiguratorStore()

  // Load species if not already loaded
  if (species.length === 0) {
    loadSpecies()
  }

  // Combine male and female profiles into one array
  const allProfiles = [...profiles.male, ...profiles.female]

  if (allProfiles.length === 0) {
    return (
      <div className="rounded-2xl bg-white drop-shadow-md p-6 max-w-2xl">
        <p className="text-gray-500 text-sm">Loading profiles...</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-6 flex flex-col max-w-2xl">
      <div className="flex items-center justify-between">
        {/* <h3 className="font-medium text-gray-700">Profiles</h3> */}
        <span className="text-xs text-gray-500">{allProfiles.length} available</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {allProfiles.map((profile) => {
          const isSelected = selectedProfile === profile.id
          const genderIcon = profile.male ? '♂' : '♀'
          const genderColor = profile.male ? 'text-blue-600' : 'text-pink-600'

          return (
            <button
              key={profile.id}
              onClick={() => selectProfile(profile.id)}
              className={`w-20 h-20 rounded-md overflow-hidden bg-gray-200 pointer-events-auto hover:opacity-100 transition-all border-2 duration-500 relative ${
                isSelected
                  ? "border-indigo-500 opacity-100"
                  : "opacity-80 border-transparent"
              }`}
            >
              {profile.thumbnail_url && (
                <img 
                  src={profile.thumbnail_url} 
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              )}
              <span className={`absolute top-1 right-1 text-lg font-bold ${genderColor} drop-shadow-md`}>
                {genderIcon}
              </span>
            </button>
          )
        })}
      </div>
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

  // Load assets for this slot
  useEffect(() => {
    const loadAssets = async () => {
      if (!selectedProfile) return
      
      setLoading(true)
      try {
        // Import the catalog functions
        const { getProfileById, getCompatibleAssets } = await import('./Catalog')
        
        // Get profile details
        const profile = await getProfileById(selectedProfile)
        
        // Fetch compatible assets for this slot
        const assets = await getCompatibleAssets(slot.id, profile)
        
        setSlotAssets(assets)
      } catch (error) {
        console.error('Failed to load assets for slot:', slot.id, error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAssets()
  }, [slot.id, selectedProfile])

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
          // Check if this asset is selected
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