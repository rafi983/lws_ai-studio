import React from "react";
import ImageCard from "./ImageCard";
import ImageSkeleton from "./ImageSkeleton";
import FailedImageCard from "./FailedImageCard";

const ImageGrid = ({ images, loading, error, onDownload }) => {
  return (
    <>
      {loading && images.every((img) => img && img.isLoading) && (
        <p className="text-center py-4 text-zinc-300">
          Generating images... Please wait.
        </p>
      )}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => {
          if (image?.isLoading)
            return <ImageSkeleton key={`skeleton-${index}`} />;
          if (image)
            return (
              <ImageCard
                // --- FIX: A guaranteed unique key ---
                // Combines the permanent URL and the index to ensure the key is always
                // unique, even if multiple images share the same source URL.
                key={`${image.permanentUrl}-${index}`}
                image={image}
                onDownload={onDownload}
              />
            );
          return <FailedImageCard key={`failed-${index}`} />;
        })}
      </div>
    </>
  );
};

export default ImageGrid;
