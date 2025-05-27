import React from "react";

const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  const aspectRatio =
    image.width && image.height ? `${image.width}:${image.height}` : "N/A";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 text-white max-w-3xl w-full p-6 rounded-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-white"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <img
          src={image.displayUrl || image.imageUrl}
          alt={image.prompt || "Generated Image"}
          className="w-full h-auto max-h-[60vh] object-contain mb-4 rounded"
        />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-400">Prompt:</span>
            <p>{image.prompt || "N/A"}</p>
          </div>
          <div>
            <span className="text-zinc-400">Model:</span>
            <p>{image.model || "N/A"}</p>
          </div>
          <div>
            <span className="text-zinc-400">Seed:</span>
            <p>{image.seed || "N/A"}</p>
          </div>
          <div>
            <span className="text-zinc-400">Aspect Ratio:</span>
            <p>{aspectRatio}</p>
          </div>
          <div>
            <span className="text-zinc-400">Width:</span>
            <p>{image.width || "N/A"}</p>
          </div>
          <div>
            <span className="text-zinc-400">Height:</span>
            <p>{image.height || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
