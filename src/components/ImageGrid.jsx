import React from "react";
import ImageCard from "./ImageCard";
import ImageSkeleton from "./ImageSkeleton";
import FailedImageCard from "./FailedImageCard";

const ImageGrid = ({ images, loading, error, onDownload }) => {
  const showPlaceholder = !loading && images.length === 0 && !error;

  return (
    <>
      {loading && images.every((img) => img && img.isLoading) && (
        <p className="text-center py-4 text-zinc-300">
          Generating images... Please wait.
        </p>
      )}
      {error && <p className="text-center text-red-400">{error}</p>}

      {showPlaceholder && (
        <div className="flex items-center justify-center text-center h-64 border-2 border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500">
            Enter a prompt and click generate.
            <br />
            Your images will appear here.
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => {
            if (image?.isLoading)
              return <ImageSkeleton key={`skeleton-${index}`} />;
            if (image)
              return (
                <ImageCard
                  key={`${image.permanentUrl}-${index}`}
                  image={image}
                  onDownload={onDownload}
                />
              );
            return <FailedImageCard key={`failed-${index}`} />;
          })}
        </div>
      )}
    </>
  );
};

export default ImageGrid;
