import { supabase } from './SupabaseClient'

// ============================================================================
// SPECIES & PROFILES
// ============================================================================

/**
 * Get all published species
 * @returns {Promise<Array>} Array of species objects
 */
export async function getSpecies() {
  try {
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching species:', error)
    throw error
  }
}

/**
 * Get profiles for a specific species, grouped by gender
 * @param {string} speciesId - UUID of the species
 * @returns {Promise<{male: Array, female: Array}>} Profiles grouped by gender
 */
export async function getProfilesBySpecies(speciesId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('species_id', speciesId)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    // Group by gender
    const profiles = data || []
    return {
      male: profiles.filter(p => p.male === true),
      female: profiles.filter(p => p.male === false)
    }
  } catch (error) {
    console.error('Error fetching profiles:', error)
    throw error
  }
}

/**
 * Get a single profile by ID
 * @param {string} profileId - UUID of the profile
 * @returns {Promise<Object>} Profile object
 */
export async function getProfileById(profileId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

/**
 * Get default base parts for a profile (5 body parts)
 * @param {string} profileId - UUID of the profile
 * @returns {Promise<Object>} Object with base assets keyed by asset_group
 */
export async function getProfileDefaultParts(profileId) {
  try {
    const { data, error } = await supabase
      .from('profile_default_parts')
      .select(`
        asset_group,
        assets:default_asset_id (
          id,
          display_name,
          file_url,
          thumbnail_url,
          slot_id,
          rig_class,
          thickness,
          species_id,
          male
        )
      `)
      .eq('profile_id', profileId)

    if (error) throw error

    // Transform into object keyed by asset_group
    const baseAssets = {}
    data.forEach(item => {
      baseAssets[item.asset_group] = item.assets
    })

    return baseAssets
  } catch (error) {
    console.error('Error fetching profile default parts:', error)
    throw error
  }
}

// ============================================================================
// MAIN CATEGORIES (UI)
// ============================================================================

/**
 * Get main categories for UI navigation
 * These are hardcoded as they represent the top-level UI structure
 * @returns {Array<string>} Array of main category names
 */
export function getMainCategories() {
  return ['species', 'head', 'body', 'clothing', 'gear', 'pose']
}

// ============================================================================
// ASSET SLOTS (SUB-CATEGORIES)
// ============================================================================

/**
 * Get asset slots for a specific main category
 * @param {string} mainCategory - Main category name (e.g., 'body', 'clothing')
 * @returns {Promise<Array>} Array of asset slot objects
 */
export async function getAssetSlotsByMainCategory(mainCategory) {
  try {
    const { data, error } = await supabase
      .from('asset_slots')
      .select('*')
      .eq('main_category', mainCategory)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching asset slots:', error)
    throw error
  }
}

/**
 * Get a single asset slot by ID
 * @param {string} slotId - UUID of the slot
 * @returns {Promise<Object>} Asset slot object
 */
export async function getAssetSlotById(slotId) {
  try {
    const { data, error } = await supabase
      .from('asset_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching asset slot:', error)
    throw error
  }
}

// ============================================================================
// ASSETS
// ============================================================================

/**
 * Get all assets for a specific slot
 * @param {string} slotId - UUID of the slot
 * @returns {Promise<Array>} Array of asset objects
 */
export async function getAssetsBySlot(slotId) {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('slot_id', slotId)
      .eq('is_published', true)
      .order('display_name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching assets:', error)
    throw error
  }
}

/**
 * Get a single asset by ID
 * @param {string} assetId - UUID of the asset
 * @returns {Promise<Object>} Asset object
 */
export async function getAssetById(assetId) {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching asset:', error)
    throw error
  }
}

/**
 * Get compatible assets for a specific slot and profile
 * Filters assets based on fit_rules that match the profile's characteristics
 * 
 * @param {string} slotId - UUID of the slot
 * @param {Object} profileDetails - Profile object with rig_class, thickness, species_id, male
 * @returns {Promise<Array>} Array of compatible asset objects
 */
// export async function getCompatibleAssets(slotId, profileDetails) {
//   try {
//     // First get the slot to know which asset_group it targets
//     const slot = await getAssetSlotById(slotId)
    
//     // Get all assets for this slot with their fit_rules
//     const { data: assets, error } = await supabase
//       .from('assets')
//       .select(`
//         *,
//         fit_rules (
//           target_group,
//           rig_class,
//           thickness,
//           species_id,
//           male
//         )
//       `)
//       .eq('slot_id', slotId)
//       .eq('is_published', true)

//     if (error) throw error

//     // Filter assets based on fit_rules
//     // An asset is compatible if it has at least one fit_rule that matches the profile
//     const compatibleAssets = (assets || []).filter(asset => {
//       // If no fit_rules, asset is compatible with everything
//       if (!asset.fit_rules || asset.fit_rules.length === 0) {
//         return true
//       }

//       // Check if any fit_rule matches the profile
//       return asset.fit_rules.some(rule => {
//         // NULL in fit_rule means "wildcard" - matches anything
//         const rigClassMatch = rule.rig_class === null || rule.rig_class === profileDetails.rig_class
//         const thicknessMatch = rule.thickness === null || rule.thickness === profileDetails.thickness
//         const speciesMatch = rule.species_id === null || rule.species_id === profileDetails.species_id
//         const genderMatch = rule.male === null || rule.male === profileDetails.male

//         // Asset is compatible if ALL conditions match
//         return rigClassMatch && thicknessMatch && speciesMatch && genderMatch
//       })
//     })

//     return compatibleAssets
//   } catch (error) {
//     console.error('Error fetching compatible assets:', error)
//     throw error
//   }
// }

// SIMPLIFIED for Kickstarter — no fit_rules filtering
export async function getCompatibleAssets(slotId, profileDetails, armorClassId = null, legsSpeciesId = undefined) {
  try {
    let query = supabase
      .from('assets')
      .select('*, armor_classes(slug, display_name)')  // join for display
      .eq('slot_id', slotId)
      .eq('is_published', true)
      .eq('rig_class', profileDetails.rig_class)
      .eq('thickness', profileDetails.thickness)

      console.log(['getCompatibleAssets'], { 'slotId': slotId, 'armorClassId': armorClassId, 'legsSpeciesId': legsSpeciesId, 'rigClass': profileDetails.rig_class, 'thickness': profileDetails.thickness, 'speciesId': profileDetails.species_id })
    // Legs equipment: filter by what base legs the user has equipped
    // undefined = not a legs slot, use default profile-based filtering
    // null = shared legs equipped, show only shared (species_id IS NULL) armor
    // uuid = species-specific legs equipped, show only that species' armor
    if (legsSpeciesId !== undefined) {
      if (legsSpeciesId === null) {
        query = query.is('species_id', null)
      } else {
        query = query.eq('species_id', legsSpeciesId)
      }
    } else {
      query = query.or(`species_id.is.null,species_id.eq.${profileDetails.species_id}`)
    }

    query = query.order('display_name', { ascending: true })

    if (armorClassId) {
      query = query.eq('armor_class_id', armorClassId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching assets:', error)
    throw error
  }
}

// ============================================================================
// POSES
// ============================================================================

/**
 * Get all published poses
 * @returns {Promise<Array>} Array of pose objects
 */
export async function getPoses() {
  try {
    const { data, error } = await supabase
      .from('poses')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching poses:', error)
    throw error
  }
}

/**
 * Get a single pose by ID
 * @param {string} poseId - UUID of the pose
 * @returns {Promise<Object>} Pose object
 */
export async function getPoseById(poseId) {
  try {
    const { data, error } = await supabase
      .from('poses')
      .select('*')
      .eq('id', poseId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching pose:', error)
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if an asset is compatible with a profile based on fit_rules
 * This is a helper that can be used for client-side filtering
 * 
 * @param {Object} asset - Asset object with fit_rules array
 * @param {Object} profile - Profile object with rig_class, thickness, species_id, male
 * @returns {boolean} True if asset is compatible
 */
export function isAssetCompatible(asset, profile) {
  // If no fit_rules, asset is compatible with everything
  if (!asset.fit_rules || asset.fit_rules.length === 0) {
    return true
  }

  // Check if any fit_rule matches the profile
  return asset.fit_rules.some(rule => {
    const rigClassMatch = rule.rig_class === null || rule.rig_class === profile.rig_class
    const thicknessMatch = rule.thickness === null || rule.thickness === profile.thickness
    const speciesMatch = rule.species_id === null || rule.species_id === profile.species_id
    const genderMatch = rule.male === null || rule.male === profile.male

    return rigClassMatch && thicknessMatch && speciesMatch && genderMatch
  })
}