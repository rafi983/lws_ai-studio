import React from "react";
import ImageCard from "./ImageCard";
import ImageSkeleton from "./ImageSkeleton";
import FailedImageCard from "./FailedImageCard";

const ImageGrid = ({
  images,
  loading,
  error,
  onDownload,
  onImageClick,
  onEdit,
  onSelectCompare,
  comparisonImages = [],
}) => {
  const showPlaceholder = !loading && images.length === 0 && !error;

  if (
    loading &&
    images.length > 0 &&
    // FIX: Add a guard to ensure 'img' exists before accessing its properties.
    images.every(
      (img) => img && (img.status === "queued" || img.status === "loading"),
    )
  ) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <ImageSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      {error && <p className="text-center text-red-400 py-4">{error}</p>}

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
            if (!image) {
              return null;
            }

            if (
              image.status === "error" &&
              !image.displayUrl &&
              !image.permanentUrl
            ) {
              return <FailedImageCard key={image.id || `failed-${index}`} />;
            }

            const isSelected = comparisonImages.some((i) => i.id === image.id);

            return (
              <ImageCard
                key={image.id || image.permanentUrl || `img-${index}`}
                image={image}
                isSelected={isSelected}
                onDownload={onDownload}
                onClick={() => {
                  if (
                    image.status === "ready" &&
                    (image.displayUrl || image.permanentUrl) &&
                    onImageClick
                  ) {
                    onImageClick(index);
                  }
                }}
                onEdit={onEdit}
                onSelectCompare={onSelectCompare}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default ImageGrid;
