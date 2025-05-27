import React from "react";
import { useFavourites } from "../context/FavouritesContext";
import ImageCard from "../components/ImageCard";

const FavouritesPage = () => {
  const { state } = useFavourites();
  const favourites = Object.values(state.favourites);

  const handleDownload = (image) => {
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
