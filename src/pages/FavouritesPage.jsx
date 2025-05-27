import React from "react";
import { useFavourites } from "../context/FavouritesContext";
import ImageCard from "../components/ImageCard";

const FavouritesPage = () => {
  const { state } = useFavourites();

  return (
    <>
      <h2 className="text-4xl font-bold mb-8">
        Your Favourites <span className="text-2xl">⭐</span>
      </h2>

      {state.favourites.length === 0 ? (
        <p className="text-zinc-400 text-center mt-12">
          You haven't favourited any images yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {state.favourites.map((image) => (
            <ImageCard key={image.permanentUrl} image={image} />
          ))}
        </div>
      )}
    </>
  );
};

export default FavouritesPage;
