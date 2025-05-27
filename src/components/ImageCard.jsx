import React, { useState } from "react";

export default function ImageCard({ image, onDownload, onClick }) {
  const [hasError, setHasError] = useState(false);
  const imageUrlToDisplay = image.displayUrl || image.imageUrl;

  if (hasError || !imageUrlToDisplay) {
    return (
      <div className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-center p-4">
        <p className="text-zinc-400 text-sm">Unable to load image.</p>
      </div>
    );
  }

  return (
    <div
      className="image-card rounded-xl overflow-hidden cursor-pointer relative group bg-zinc-900"
      onClick={onClick} // 💡 Pass click handler
    >
      {onDownload && (
        <div
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all z-20"
          onClick={(e) => {
            e.stopPropagation(); // Prevent modal opening when download clicked
            onDownload(image);
          }}
          title="Download Image"
        >
          {/* SVG Download Icon */}
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
        </div>
      )}

      <img
        src={imageUrlToDisplay}
        alt={image.prompt || "Generated AI"}
        className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
        onError={() => setHasError(true)}
      />

      {image.model && (
        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
          <p
            className="text-white text-xs font-semibold truncate"
            title={image.model}
          >
            Model: {image.model}
          </p>
        </div>
      )}
    </div>
  );
}
