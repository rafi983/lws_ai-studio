import React, { useState } from "react";
import { useFavourites } from "../context/FavouritesContext";
import { FiClock, FiAlertTriangle } from "react-icons/fi";

export default function ImageCard({ image, onDownload, onClick, onEdit }) {
  const [hasError, setHasError] = useState(false);
  const { state, dispatch } = useFavourites();

  const imageId = image.id || image.permanentUrl;
  const isFav = imageId ? !!state.favourites[imageId] : false;

  const toggleFav = (e) => {
    e.stopPropagation();
    if (!imageId) return;
    dispatch({ type: "TOGGLE_FAVOURITE", payload: { ...image, id: imageId } });
  };

  const imageUrlToDisplay = image.displayUrl || image.permanentUrl;

  const renderContent = () => {
    if (image.status === "queued") {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
          <FiClock className="w-8 h-8 animate-pulse" />
          <p className="text-sm text-center">
            Queued for generating...
            <br />
            Hang tight! Your art will start soon.
          </p>
        </div>
      );
    }

    if (image.status === "loading") {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-zinc-300">
          <div className="relative w-12 h-12">
            <svg
              className="animate-spin w-12 h-12 text-purple-500"
              viewBox="0 0 50 50"
              fill="none"
            >
              <circle
                className="opacity-30"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="5"
              />
              <path
                d="M25 5 a20 20 0 0 1 0 40 a20 20 0 0 1 0 -40"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                className="text-purple-600"
                fill="none"
              />
            </svg>
          </div>
          <p className="text-sm text-center text-zinc-400">
            Generating your masterpiece…
            <br />
            Please wait{" "}
            <span className="text-purple-400 font-medium">10–15 seconds</span>.
          </p>

          {/* Progress Bar */}
          <div className="w-3/5 h-1 bg-purple-700/30 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      );
    }

    if (hasError || image.status === "error") {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-red-400">
          <FiAlertTriangle className="w-8 h-8" />
          <p className="text-sm text-center">Unable to load image.</p>
        </div>
      );
    }

    if (image.status === "ready" && imageUrlToDisplay && !hasError) {
      return (
        <>
          <img
            src={imageUrlToDisplay}
            alt={image.prompt || "Generated AI"}
            className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            onError={() => setHasError(true)}
            loading="lazy"
          />
          {isFav && (
            <div className="absolute top-2 left-2 bg-pink-600 text-xs text-white px-2 py-0.5 rounded-full z-10">
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
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81
                    14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5
                    0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81
                    14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5
                    0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              )}
            </button>

            {onDownload && (
              <button
                className="p-2 bg-black/50 rounded-full hover:bg-black/80 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(image);
                }}
                title="Download"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}

            {onEdit && (
              <button
                className="p-2 bg-black/50 rounded-full hover:bg-black/80 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(image);
                }}
                title="Edit"
              >
                ✎
              </button>
            )}
          </div>
        </>
      );
    }

    return null;
  };

  const isClickable =
    image.status === "ready" && imageUrlToDisplay && !hasError;

  return (
    <div
      className={`relative group rounded-xl overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#1a0b2e] w-full h-48 flex items-center justify-center text-center p-4 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
      onClick={() => {
        if (isClickable && onClick) {
          onClick();
        }
      }}
    >
      {renderContent()}
    </div>
  );
}
