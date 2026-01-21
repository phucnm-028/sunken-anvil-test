import {create} from "zustand"
import { supabase } from "./components/SupabaseClient";

export const USE_POCKETBASE = true;

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL;
if (!POCKETBASE_URL) {
  throw new Error('VITE_POCKETBASE_URL is required')
}
export const pb = new PocketBase(POCKETBASE_URL);

// Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!USE_POCKETBASE && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error("Missing Supabase environment variables");
}
export const sb = USE_POCKETBASE 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);


const fetchCategories = async (set) => {
    let categories;
    let assets;

    if (USE_POCKETBASE) {
        console.log("Using PocketBase");
        categories = await pb.collection('CustomizationGroups').getFullList({
            sort: "+position",
        });
        assets = await pb.collection('CustomizationAssets').getFullList({
            sort: "-created"
        });
    } else {
        throw new Error("Supabase is not enabled");
    }

    const customization = {};
    const assetNamesByCategory = {};
    let poseNames = [];

    categories.forEach((category) => {
        // for each category/group, get the associated assets
        category.assets = assets.filter((asset) => asset.group === category.id);
        assetNamesByCategory[category.name] = category.assets.map((asset) => asset.name);

        // for pose, get the asset name to extract from NLA animation
        if (category.name?.toLowerCase() === "pose") {
            poseNames = assetNamesByCategory[category.name];
        }

        customization[category.name] = {};
    });
    
    set({
        categories,
        currentCategory: categories[0] ?? null,
        assets,
        customization,
        assetNamesByCategory,
        poses: poseNames,
    })
};

// hook for configurator store
export const useConfiguratorStore = create((set, get) => ({
    categories: [],
    currentCategory: null,
    assets: [],
    customization: {},
    assetNamesByCategory: {},

    fetchCategories: async () => {
        await fetchCategories(set);
    },
    setCurrentCategory: (category) => set({currentCategory: category}),
    
    // change asset func
    changeAsset: (category, asset) => set((state) => ({
        customization: {
            ...state.customization,
            [category]: {...state.customization[category], asset},
        }
    })),

    // pose 
    poses: [],
    currentPose: null,
    setPoses: (list) => set({poses: list}),
    setCurrentPose: (poseName) => set({currentPose: poseName}),
}))

useConfiguratorStore.getState().fetchCategories();
