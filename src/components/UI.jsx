import { useEffect } from "react";
import { useConfiguratorStore, pb } from "../store";


const AssetBox = () => {
    const {
        categories, 
        currentCategory, 
        fetchCategories, 
        setCurrentCategory, 
        changeAsset, 
        customization} = 
    useConfiguratorStore();

    useEffect(() => {
        fetchCategories();
    }, []);
    return (
        <div className="rounded-2xl bg-white drop-shadow-md p-6 gap-6 flex flex-col">
            <div className="flex items-center gap-6 pointer-events-auto">
                {categories.map((category) => (
                    <button 
                        key={category.id} 
                        onClick={() => setCurrentCategory(category)}
                        className = {`transition-colors duration-200 font-medium ${
                            currentCategory.name === category.name
                            ? "text-indigo-500"
                            : "text-gray-500 hover:text-gray-700"
                        }`} 
                        >
                            {category.name}
                    </button>
                ))}
            </div>
            <div className="flex gap-2 flex-wrap">
                {currentCategory?.assets.map((asset, index) => (
                    <button
                        key={index}
                        onClick={() => changeAsset(currentCategory.name, asset)}
                        className={`w-20 h-20 rounded-md overflow-hidden bg-gray-200 pointer-events-auto hover:opacity-100 transition-all border-2 duration-500
                            ${
                                customization[currentCategory.name]?.asset?.id === asset.id
                                ? "border-indigo-500 opacity-100"
                                : "opacity-80 border-transparent"
                            }`}
                    >
                        <img src={pb.files.getURL(asset, asset.thumbnail)}/>
                    </button>
                ))}
            </div>
        </div>
    )
};

const DownloadButton = () => {
    return(
        <button className="rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-white font-medium px-4 py-3 pointer-events-auto">
            Download
        </button>
    );
};

export const UI = () => {
    return(
        <main className="pointer-events-none fixed z-10 inset-0 p-10">
            <div className="mx-auto h-full max-w-screen-xl w-full flex flex-col justify-between">
                <div className="flex justify-between items-center">
                    <a className="pointer-events-auto" href="/">
                    <img className="w-20" src="images/b&b_logo.png"/>       
                    </a>
                    <DownloadButton/>
                </div>

                <div className="flex flex-col gap-6">
                    <AssetBox/>
                </div>
            </div>
        </main>
    )
}