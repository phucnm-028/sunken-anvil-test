import {create} from "zustand"


import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL;
if (!POCKETBASE_URL) {
  throw new Error('VITE_POCKETBASE_URL is required')
}
export const pb = new PocketBase(POCKETBASE_URL);

export const useConfiguratorStore = create((set, get) => ({
    categories: [],
    currentCategory: null,
    assets: [],
    customization: {},
//   customization: {
//     "Head":{},
//     "hair":{},
//     "face":{},
//     "eyes":{},
//     "eyebrows":{},
//     "nose":{},
//     "facialHair":{},
//     "glasses":{},
//     "hat":{},
//     "top":{},
//     "bottom":{},
//     "shoe":{},
//     "accessories":{},
//   },
    fetchCategories: async () => {
        const categories = await pb.collection('CustomizationGroups').getFullList({
            sort: "+position",
        });
        const assets = await pb.collection('CustomizationAssets').getFullList({
            sort: "-created"
        });
        
        const customization = {};

        categories.forEach((category) => {
            category.assets = assets.filter((asset) => asset.group === category.id);
            customization[category.name] = {};
        });
  
        set({categories, currentCategory: categories[0], assets, customization})
    },
    setCurrentCategory: (category) => set({currentCategory: category}),
    changeAsset: (category, asset) => set((state) => ({
        customization: {
            ...state.customization,
            [category]: {...state.customization[category], asset},
        }
    }))
}))

useConfiguratorStore.getState().fetchCategories();