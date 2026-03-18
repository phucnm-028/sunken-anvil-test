import { useState } from "react"
import { useConfiguratorStore } from "../store"
import {
  SpeciesSelector,
  PoseSelector,
  AllAssetsVertical,
  NoProfileSelected,
} from "./CategoryContent"


const CATEGORY_LABELS = { species: "Race" }

// ============================================================================
// MAIN CATEGORY NAVIGATION  (desktop sidebar — unchanged)
// ============================================================================

const MainCategoryNav = () => {
  const { mainCategories, currentMainCategory, selectMainCategory, selectedProfile } =
    useConfiguratorStore()

  return (
    <div className="rounded-2xl bg-white drop-shadow-md p-4">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {mainCategories.map((category) => {
          const isActive        = currentMainCategory === category
          const requiresProfile = category !== "species"
          const isDisabled      = requiresProfile && !selectedProfile

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
              {CATEGORY_LABELS[category] ?? category}
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
// CATEGORY CONTENT RENDERER  (shared between desktop panel & mobile drawer)
// ============================================================================

const CategoryContentRenderer = () => {
  const { currentMainCategory, selectedProfile } = useConfiguratorStore()

  if (!currentMainCategory) return null
  if (currentMainCategory === "species") return <SpeciesSelector />
  if (currentMainCategory === "pose") {
    return selectedProfile ? <PoseSelector /> : <NoProfileSelected />
  }
  if (["head", "body", "clothing", "gear"].includes(currentMainCategory)) {
    return selectedProfile ? <AllAssetsVertical /> : <NoProfileSelected />
  }
  return null
}

// ============================================================================
// MOBILE BOTTOM TAB BAR
// z-40: always above the drawer (z-30) so it stays tappable at all times.
// ============================================================================

const MobileBottomBar = ({ onCategorySelect }) => {
  const { mainCategories, currentMainCategory, selectedProfile } =
    useConfiguratorStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-auto bg-white border-t border-gray-200 flex">
      {mainCategories.map((category) => {
        const isActive        = currentMainCategory === category
        const requiresProfile = category !== "species"
        const isDisabled      = requiresProfile && !selectedProfile

        return (
          <button
            key={category}
            onClick={() => !isDisabled && onCategorySelect(category)}
            disabled={isDisabled}
            className={`flex-1 flex items-center justify-center min-h-[56px] text-sm font-medium capitalize transition-colors duration-200 ${
              isActive
                ? "text-red-500 border-t-2 border-red-500"
                : isDisabled
                ? "text-gray-300"
                : "text-gray-600 active:bg-gray-50"
            }`}
          >
            {CATEGORY_LABELS[category] ?? category}
          </button>
        )
      })}
    </nav>
  )
}

// ============================================================================
// MOBILE DRAWER
//
// Fixes vs previous version:
//   1. bottom-0 (was bottom-14): translate-y-full now pushes it fully off screen
//   2. pointer-events-none when closed: tab bar taps go through cleanly
//   3. pb-14 on scroll area: content stops above the 56px tab bar
//   4. z-30 for drawer/backdrop, z-40 for tab bar: correct stacking order
// ============================================================================

const MobileDrawer = ({ isOpen, onClose }) => {
  const { currentMainCategory } = useConfiguratorStore()

  return (
    <>
      {/* Backdrop — z-30, below the z-40 tab bar */}
      <div
        className={`fixed inset-0 z-30 md:hidden bg-black/20 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel
            bottom-0              → translate-y-full hides it fully below viewport
            pointer-events-none   → tab bar receives taps when drawer is closed
            pb-14                 → scroll content clears the 56px tab bar       */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-30 md:hidden bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen
            ? "translate-y-0 pointer-events-auto"
            : "translate-y-full pointer-events-none"
        }`}
        style={{ maxHeight: "35vh" }}
      >
        {/* Handle row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
          <span className="text-sm font-semibold text-gray-600 capitalize">
            {currentMainCategory ?? ""}
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300 transition-colors text-lg leading-none"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Scrollable content — pb-14 clears the 56px tab bar */}
        <div
          className="overflow-y-auto px-4 pt-3 pb-14 pointer-events-auto"
          style={{ maxHeight: "calc(35vh - 52px)" }}
        >
          <CategoryContentRenderer />
        </div>
      </div>
    </>
  )
}

// ============================================================================
// MAIN UI COMPONENT
// ============================================================================

export const UI = () => {
  const { error, isLoading, clearError, selectMainCategory } = useConfiguratorStore()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleMobileCategorySelect = async (category) => {
    await selectMainCategory(category)
    setMobileDrawerOpen(true)
  }

  return (
    <>
      {/* ── DESKTOP layout (md and above) ── */}
      <main className="pointer-events-none fixed z-10 inset-0 p-10 hidden md:flex">
        <div className="h-full w-full flex gap-6">
          {/* Left Column */}
          <div className="w-48 flex flex-col gap-4 overflow-y-auto pointer-events-auto">
            <a className="pointer-events-auto" href="/">
              <img className="w-20" src="images/b&b_logo.png" alt="Blubber & Bits" />
            </a>

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

            {isLoading && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 drop-shadow-md p-3 pointer-events-auto">
                <p className="text-blue-700 text-xs">Loading...</p>
              </div>
            )}

            <MainCategoryNav />
          </div>

          {/* Right Column */}
          <div className="w-68 flex flex-col gap-4 overflow-y-auto pointer-events-auto">
            {/* <div className="flex justify-end">
              <DownloadButton />
            </div> */}
            <CategoryContentRenderer />
          </div>
        </div>
      </main>

      {/* ── MOBILE layout (below md) ── */}

      {/* Top-left logo */}
      <div className="fixed top-4 left-4 z-10 md:hidden pointer-events-auto">
        <a href="/">
          <img className="w-12" src="images/b&b_logo.png" alt="Blubber & Bits" />
        </a>
      </div>

      {/* Top-right download */}
      {/* <div className="fixed top-4 right-4 z-10 md:hidden pointer-events-auto">
        <DownloadButton />
      </div> */}

      {/* Toasts */}
      <div className="fixed top-20 left-4 right-4 z-10 md:hidden flex flex-col gap-2 pointer-events-auto">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 drop-shadow-md p-3">
            <p className="text-red-700 text-xs">{error}</p>
            <button onClick={clearError} className="text-red-500 font-medium text-xs mt-1">
              Dismiss
            </button>
          </div>
        )}
        {isLoading && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 drop-shadow-md p-3">
            <p className="text-blue-700 text-xs">Loading...</p>
          </div>
        )}
      </div>

      {/* Slide-up drawer (z-30) */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Bottom tab bar (z-40 — always on top of drawer) */}
      <MobileBottomBar onCategorySelect={handleMobileCategorySelect} />
    </>
  )
}