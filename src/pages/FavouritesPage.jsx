import React from "react";
import { useFavourites } from "../context/FavouritesContext";
import { useDownloads } from "../context/DownloadsContext";
import ImageCard from "../components/ImageCard";
import toast from "react-hot-toast";

const FavouritesPage = () => {
  const { state: favState } = useFavourites();
  const { dispatch: downloadDispatch } = useDownloads();
  const favourites = Object.values(favState.favourites);

  const handleDownload = (image) => {
    // The image object from Favourites context should already have its original id
    // We construct a payload to be explicit and ensure consistency.
    const downloadPayload = {
      id: image.id, // <-- ENSURE THIS IS PASSED
      permanentUrl: image.permanentUrl,
      prompt: image.prompt,
      model: image.model,
      seed: image.seed,
      width: image.width,
      height: image.height,
      displayUrl: image.displayUrl, // Pass this along, DownloadsContext will clarify it
    };

    dispatchDownload({
      type: "ADD_DOWNLOAD",
      payload: downloadPayload,
    });

    toast.success("Download started!");
    fetch(image.permanentUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${image.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch(() => toast.error("Download failed."));
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">
        Your Favourites <span className="text-2xl">⭐</span>
      </h2>

      {favourites.length === 0 ? (
        <p className="text-zinc-400 text-center mt-12">
          You haven't favourited any images yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favourites.map((image) => (
            <ImageCard
              key={image.id || image.permanentUrl} // Use image.id as primary key
              image={image}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;
