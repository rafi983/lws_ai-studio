import React, { useState } from "react";
import ImageCard from "./ImageCard";
import ImageSkeleton from "./ImageSkeleton";
import FailedImageCard from "./FailedImageCard";
import ImageModal from "./ImageModal";

const ImageGrid = ({ images, loading, error, onDownload }) => {
  const [modalImage, setModalImage] = useState(null);

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
                key={image.permanentUrl || index}
                image={image}
                onDownload={onDownload}
                onClick={() => setModalImage(image)} // 💡 Click to open modal
              />
            );
          return <FailedImageCard key={`failed-${index}`} />;
        })}
      </div>

      {/* Modal */}
      {modalImage && (
        <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
      )}
    </>
  );
};

export default ImageGrid;
