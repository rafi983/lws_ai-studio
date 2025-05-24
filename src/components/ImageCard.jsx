import React, { useState } from "react";

export default function ImageCard({ img, onDownload }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !img) {
    return (
      <div className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-center p-4">
        <p className="text-zinc-400 text-sm">Unable to load image.</p>
      </div>
    );
  }

  return (
    <div className="image-card rounded-xl overflow-hidden cursor-pointer relative group">
      <div
        className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all z-10"
        onClick={() => onDownload(img)}
        title="Download Image"
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
      </div>
      <img
        src={img}
        alt="Generated AI"
        className="w-full h-48 object-cover rounded"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
