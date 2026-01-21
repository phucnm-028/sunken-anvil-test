import { create } from "zustand"
import {
  getSpecies,
  getProfilesBySpecies,
  getProfileById,
  getProfileDefaultParts,
  getMainCategories,
  getAssetSlotsByMainCategory,
  getCompatibleAssets,
  getPoses,
} from "./components/Catalog"

// ============================================================================
// ZUSTAND STORE - The Sunken Anvil Character Configurator
// ============================================================================

export const useConfiguratorStore = create((set, get) => ({
  // ==========================================================================
  // STATE - Species & Profile Selection
  // ==========================================================================
  
  species: [],                      // All available species
  selectedSpecies: null,            // Currently selected species (ID)
  profiles: { male: [], female: [] }, // Profiles for selected species, grouped by gender
  selectedProfile: null,            // Currently selected profile (ID)
  profileDetails: null,             // Full profile object (for fit_rules)
  
  // Base assets (5 body parts) from the selected profile
  baseAssets: {
    head: null,
    torso: null,
    left_arm: null,
    right_arm: null,
    legs: null,
  },

  // ==========================================================================
  // STATE - UI Navigation (Hierarchical)
  // ==========================================================================
  
  mainCategories: getMainCategories(), // ['species', 'head', 'body', 'clothing', 'gear', 'pose']
  currentMainCategory: null,           // Which main category is selected
  
  assetSlots: [],                      // Sub-categories for current main category
  currentSlot: null,                   // Which sub-category/slot is selected
  
  // ==========================================================================
  // STATE - Assets & Equipment
  // ==========================================================================
  
  availableAssets: [],                 // Assets available for current slot (filtered by fit_rules)
  
  // Equipped items (layered on top of base assets)
  // Arrays to support multi-select slots
  equippedAssets: {
    head: [],
    torso: [],
    left_arm: [],
    right_arm: [],
    legs: [],
  },

  // ==========================================================================
  // STATE - Poses
  // ==========================================================================
  
  poses: [],                           // All available poses
  currentPose: null,                   // Currently selected pose (ID)

  // ==========================================================================
  // STATE - Loading & Error Handling
  // ==========================================================================
  
  isLoading: false,
  error: null,

  // ==========================================================================
  // ACTIONS - Species & Profile Flow
  // ==========================================================================

  /**
   * Load all species from database
   * Called on app initialization or when user opens Species category
   */
  loadSpecies: async () => {
    set({ isLoading: true, error: null })
    try {
      const species = await getSpecies()
      set({ species, isLoading: false })
    } catch (error) {
      console.error("Failed to load species:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * Select a species and load its profiles
   * @param {string} speciesId - UUID of the species
   */
  selectSpecies: async (speciesId) => {
    set({ isLoading: true, error: null })
    try {
      const profiles = await getProfilesBySpecies(speciesId)
      set({
        selectedSpecies: speciesId,
        profiles,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to load profiles:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * Select a profile and load its 5 default base parts
   * This is the key action that initializes the character
   * @param {string} profileId - UUID of the profile
   */
  selectProfile: async (profileId) => {
    set({ isLoading: true, error: null })
    try {
      // Load profile details (for fit_rules filtering)
      const profileDetails = await getProfileById(profileId)
      
      // Load the 5 default base parts
      const baseAssets = await getProfileDefaultParts(profileId)
      
      // Reset equipped assets when changing profile
      const emptyEquipped = {
        head: [],
        torso: [],
        left_arm: [],
        right_arm: [],
        legs: [],
      }
      
      set({
        selectedProfile: profileId,
        profileDetails,
        baseAssets,
        equippedAssets: emptyEquipped,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to load profile:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * Clear profile selection and reset to initial state
   */
  clearProfile: () => {
    set({
      selectedProfile: null,
      profileDetails: null,
      baseAssets: {
        head: null,
        torso: null,
        left_arm: null,
        right_arm: null,
        legs: null,
      },
      equippedAssets: {
        head: [],
        torso: [],
        left_arm: [],
        right_arm: [],
        legs: [],
      },
      currentPose: null,
    })
  },

  // ==========================================================================
  // ACTIONS - Navigation (Main Categories & Slots)
  // ==========================================================================

  /**
   * Select a main category and load its sub-categories (asset slots)
   * @param {string} category - Main category name ('species', 'head', 'body', etc.)
   */
  selectMainCategory: async (category) => {
    // Special handling for non-asset categories
    if (category === 'species') {
      // Load species if not already loaded
      if (get().species.length === 0) {
        await get().loadSpecies()
      }
      // Auto-select first species to load profiles
      const firstSpecies = get().species[0]
      if (firstSpecies && !get().selectedSpecies) {
        await get().selectSpecies(firstSpecies.id)
      }
      set({ currentMainCategory: category, assetSlots: [], currentSlot: null })
      return
    }
    
    if (category === 'pose') {
      // Load poses if not already loaded
      if (get().poses.length === 0) {
        await get().loadPoses()
      }
      set({ currentMainCategory: category, assetSlots: [], currentSlot: null })
      return
    }

    // For head, body, clothing, gear - load asset slots
    set({ isLoading: true, error: null })
    try {
      const assetSlots = await getAssetSlotsByMainCategory(category)
      set({
        currentMainCategory: category,
        assetSlots,
        currentSlot: null,
        availableAssets: [],
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to load asset slots:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * Clear main category selection
   */
  clearMainCategory: () => {
    set({
      currentMainCategory: null,
      assetSlots: [],
      currentSlot: null,
      availableAssets: [],
    })
  },

  /**
   * Select an asset slot and load compatible assets for the current profile
   * @param {string} slotId - UUID of the asset slot
   */
  selectSlot: async (slotId) => {
    const { profileDetails } = get()
    
    if (!profileDetails) {
      console.warn("No profile selected - cannot load assets")
      return
    }

    set({ isLoading: true, error: null })
    try {
      const assets = await getCompatibleAssets(slotId, profileDetails)
      set({
        currentSlot: slotId,
        availableAssets: assets,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to load assets:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * Clear slot selection
   */
  clearSlot: () => {
    set({
      currentSlot: null,
      availableAssets: [],
    })
  },

  // ==========================================================================
  // ACTIONS - Asset Management (Equip/Unequip)
  // ==========================================================================

  /**
   * Equip an asset (equipment) to a body group
   * @param {string} bodyGroup - Body group ('head', 'torso', 'left_arm', 'right_arm', 'legs')
   * @param {Object} asset - Asset object to equip
   * @param {Object} slot - Asset slot object (to check selection_mode)
   */
  equipAsset: (bodyGroup, asset, slot) => {
    set((state) => {
      const currentEquipped = state.equippedAssets[bodyGroup] || []
      
      // Check if asset is already equipped
      const alreadyEquipped = currentEquipped.some(a => a.id === asset.id)
      if (alreadyEquipped) {
        // Toggle off - unequip
        return {
          equippedAssets: {
            ...state.equippedAssets,
            [bodyGroup]: currentEquipped.filter(a => a.id !== asset.id),
          },
        }
      }

      // Check selection mode
      if (slot?.selection_mode === 'multi') {
        // Multi-select: add to array
        return {
          equippedAssets: {
            ...state.equippedAssets,
            [bodyGroup]: [...currentEquipped, asset],
          },
        }
      } else {
        // Single-select: replace array with single item
        return {
          equippedAssets: {
            ...state.equippedAssets,
            [bodyGroup]: [asset],
          },
        }
      }
    })
  },

  /**
   * Unequip an asset from a body group
   * @param {string} bodyGroup - Body group
   * @param {string} assetId - UUID of the asset to unequip
   */
  unequipAsset: (bodyGroup, assetId) => {
    set((state) => ({
      equippedAssets: {
        ...state.equippedAssets,
        [bodyGroup]: state.equippedAssets[bodyGroup].filter(a => a.id !== assetId),
      },
    }))
  },

  /**
   * Replace a base asset for a body group
   * This is for swapping base body parts (not equipment)
   * @param {string} bodyGroup - Body group
   * @param {Object} asset - New base asset
   */
  replaceBaseAsset: (bodyGroup, asset) => {
    set((state) => ({
      baseAssets: {
        ...state.baseAssets,
        [bodyGroup]: asset,
      },
    }))
  },

  /**
   * Clear all equipped assets (keep base assets)
   */
  clearEquippedAssets: () => {
    set({
      equippedAssets: {
        head: [],
        torso: [],
        left_arm: [],
        right_arm: [],
        legs: [],
      },
    })
  },

  // ==========================================================================
  // ACTIONS - Poses
  // ==========================================================================

  /**
   * Load all poses from database
   */
  loadPoses: async () => {
    set({ isLoading: true, error: null })
    try {
      const poses = await getPoses()
      set({ poses, isLoading: false })
    } catch (error) {
      console.error("Failed to load poses:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * Set the current pose
   * @param {string} poseId - UUID of the pose (or null to clear)
   */
  setPose: (poseId) => {
    set({ currentPose: poseId })
  },

  // ==========================================================================
  // UTILITY ACTIONS
  // ==========================================================================

  /**
   * Clear all error messages
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Reset entire store to initial state
   */
  resetStore: () => {
    set({
      species: [],
      selectedSpecies: null,
      profiles: { male: [], female: [] },
      selectedProfile: null,
      profileDetails: null,
      baseAssets: {
        head: null,
        torso: null,
        left_arm: null,
        right_arm: null,
        legs: null,
      },
      currentMainCategory: null,
      assetSlots: [],
      currentSlot: null,
      availableAssets: [],
      equippedAssets: {
        head: [],
        torso: [],
        left_arm: [],
        right_arm: [],
        legs: [],
      },
      poses: [],
      currentPose: null,
      isLoading: false,
      error: null,
    })
  },
}))