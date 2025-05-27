// src/pages/FavouritesPage.jsx

import React from "react";
import { useFavourites } from "../context/FavouritesContext";
import { useDownloads } from "../context/DownloadsContext"; // FIX: Import useDownloads
import ImageCard from "../components/ImageCard";

const FavouritesPage = () => {
  const { state } = useFavourites();
  const { dispatch: dispatchDownload } = useDownloads(); // FIX: Get the dispatch function for downloads
  const favourites = Object.values(state.favourites);

  const handleDownload = (image) => {
    fetch(image.permanentUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const tempUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = tempUrl;
        a.download = `${image.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // FIX: Dispatch to add the image to downloads context
        // We spread the original image to retain permanentUrl and add the temporary imageUrl
        dispatchDownload({
          type: "ADD_DOWNLOAD",
          payload: { ...image, imageUrl: tempUrl },
        });

        // Note: We don't revoke the URL here, as it's needed for display on the downloads page.
        // URL.revokeObjectURL(a.href); // This would break the image display
      })
      .catch(() => console.error("Download failed"));
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
              key={image.permanentUrl}
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
