import { useConfiguratorStore } from "../store"
import {
  SpeciesSelector,
  PoseSelector,
  AllAssetsVertical,
  NoProfileSelected,
} from "./CategoryContent"

// ============================================================================
// MAIN CATEGORY NAVIGATION
// ============================================================================

const MainCategoryNav = () => {
  const { mainCategories, currentMainCategory, selectMainCategory, selectedProfile } = 
    useConfiguratorStore()

  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-4">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {mainCategories.map((category) => {
          const isActive = currentMainCategory === category
          
          // Disable non-species categories if no profile selected
          const requiresProfile = category !== 'species'
          const isDisabled = requiresProfile && !selectedProfile

          return (
            <button
              key={category}
              onClick={() => !isDisabled && selectMainCategory(category)}
              disabled={isDisabled}
              className={`transition-colors duration-200 font-medium capitalize py-2 px-4 rounded-md text-left ${
                isActive
                  ? "bg-red-500 text-white"
                  : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// DOWNLOAD BUTTON
// ============================================================================

const DownloadButton = () => {
  const { selectedProfile } = useConfiguratorStore()

  return (
    <button
      disabled={!selectedProfile}
      className={`rounded-lg transition-colors duration-300 text-white font-medium px-4 py-3 pointer-events-auto ${
        selectedProfile
          ? "bg-indigo-500 hover:bg-indigo-600"
          : "bg-gray-300 cursor-not-allowed"
      }`}
    >
      Download
    </button>
  )
}

// ============================================================================
// CATEGORY CONTENT RENDERER
// ============================================================================

const CategoryContentRenderer = () => {
  const { 
    currentMainCategory, 
    selectedProfile, 
  } = useConfiguratorStore()

  // No category selected
  if (!currentMainCategory) {
    return null
  }

  // Species category
  if (currentMainCategory === 'species') {
    return <SpeciesSelector />
  }

  // Pose category
  if (currentMainCategory === 'pose') {
    if (!selectedProfile) {
      return <NoProfileSelected />
    }
    return <PoseSelector />
  }

  // Asset categories (head, body, clothing, gear) - show all assets vertically
  if (['head', 'body', 'clothing', 'gear'].includes(currentMainCategory)) {
    if (!selectedProfile) {
      return <NoProfileSelected />
    }
    return <AllAssetsVertical />
  }

  return null
}

// ============================================================================
// MAIN UI COMPONENT
// ============================================================================

export const UI = () => {
  const { error, isLoading, clearError } = useConfiguratorStore()

  return (
    <main className="pointer-events-none fixed z-10 inset-0 p-10">
      <div className="h-full w-full flex gap-6">
        {/* Left Column - Logo & Main Categories */}
        <div className="w-48 flex flex-col gap-4 overflow-y-auto pointer-events-auto">
          {/* Logo at top */}
          <a className="pointer-events-auto" href="/">
            <img className="w-20" src="images/b&b_logo.png" alt="Blubber & Bits" />
          </a>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 drop-shadow-md p-3 pointer-events-auto">
              <p className="text-red-700 text-xs">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-medium text-xs mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="rounded-2xl bg-blue-50 border border-blue-200 drop-shadow-md p-3 pointer-events-auto">
              <p className="text-blue-700 text-xs">Loading...</p>
            </div>
          )}

          {/* Main Category Navigation */}
          <MainCategoryNav />
        </div>

        {/* Right Column - Content Area (single vertical column) */}
        <div className="w-68 flex flex-col gap-4 overflow-y-auto pointer-events-auto">
          {/* Download Button at top right */}
          <div className="flex justify-end">
            <DownloadButton />
          </div>

          {/* Category Content - Everything displays vertically */}
          <CategoryContentRenderer />
        </div>
      </div>
    </main>
  )
}