// src/components/ImageCard.jsx

import React, { useState } from "react";
import { useFavourites } from "../context/FavouritesContext";
import ImageModal from "./ImageModal";

export default function ImageCard({ image, onDownload }) {
  const [hasError, setHasError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { state, dispatch } = useFavourites();

  // This logic is correct
  const isFav = !!state.favourites[image.permanentUrl];

  const toggleFav = () => {
    dispatch({ type: "TOGGLE_FAVOURITE", payload: image });
  };

  // --- THIS IS THE FIX ---
  // Prioritize the temporary blob URL if it exists, otherwise use the other URLs.
  // Your code had `image.displayUrl || image.imageUrl`, which we'll adjust for consistency.
  const imageUrlToDisplay =
    image.imageUrl || image.displayUrl || image.permanentUrl;

  if (hasError || !imageUrlToDisplay) {
    return (
      <div className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-center p-4">
        <p className="text-zinc-400 text-sm">Unable to load image.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative group rounded-xl overflow-hidden bg-zinc-900">
        <img
          src={imageUrlToDisplay}
          alt={image.prompt || "Generated AI"}
          className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity cursor-pointer"
          onError={() => setHasError(true)}
          onClick={() => setModalOpen(true)}
        />

        {isFav && (
          <div className="absolute top-2 left-2 bg-pink-600 text-xs text-white px-2 py-0.5 rounded-full">
            ★ Favourite
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          <button
            className="p-2 bg-black/50 rounded-full hover:bg-black/80 transition"
            onClick={toggleFav}
            title={isFav ? "Unfavourite" : "Favourite"}
          >
            {isFav ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
          </button>

          {/* This logic you already had is perfect. It connects to the context updater. */}
          {onDownload && (
            <button
              className="p-2 bg-black/50 rounded-full hover:bg-black/80 transition"
              onClick={() => onDownload(image)}
              title="Download"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 17V3" />
                <path d="m6 11 6 6 6-6" />
                <path d="M19 21H5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <ImageModal image={image} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
