import React from "react";

const ImageCompareModal = ({ images, onClose }) => {
  if (!images || images.length !== 2) return null;

  const renderMetadata = (img) => (
    <div className="mt-2 text-xs text-zinc-400 text-left px-2 w-full">
      <p>
        <strong>Prompt:</strong> {img.prompt || "N/A"}
      </p>
      <p>
        <strong>Model:</strong> {img.model || "Unknown"}
      </p>
      <p>
        <strong>Seed:</strong> {img.seed || "N/A"}
      </p>
      <p>
        <strong>Size:</strong> {img.width || "?"} x {img.height || "?"} px
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-auto p-4 relative flex flex-col md:flex-row gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white"
          aria-label="Close comparison"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            className="flex flex-col items-center w-full md:w-1/2"
          >
            <img
              src={img.displayUrl || img.permanentUrl}
              alt={img.prompt || `Image ${idx + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              loading="lazy"
            />
            <p className="mt-2 text-sm text-zinc-300 text-center px-2 break-words">
              {img.prompt || "No prompt"}
            </p>
            {renderMetadata(img)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCompareModal;
