import React from "react";
import ImageCard from "./ImageCard";

const ImageGrid = ({ images, loading, error, onDownload }) => {
  const showPlaceholder = !loading && images.length === 0 && !error;

  return (
    <>
      {loading && (
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
          {images.map((image, index) => (
            <ImageCard
              key={image.id || index}
              image={image}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ImageGrid;
