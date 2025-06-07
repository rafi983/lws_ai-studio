import React, { useState, useEffect } from "react";

const MetadataRow = ({ label, value }) => (
  <p className="text-zinc-400">
    <span className="font-semibold text-zinc-300">{label}:</span> {value}
  </p>
);

const ImageCompareModal = ({ images, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!images || images.length !== 2) return null;

  const [imageA, imageB] = images;
  const commonPrompt = imageA.prompt;
  const commonModel = imageA.model;
  const commonSize = `${imageA.width || "?"} x ${imageA.height || "?"} px`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-200 ease-in-out ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col transform transition-all duration-200 ease-in-out ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-white">Image Comparison</h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            aria-label="Close comparison"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-zinc-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">
              Common Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <MetadataRow label="Model" value={commonModel || "Unknown"} />
              <MetadataRow label="Size" value={commonSize} />
              <div className="md:col-span-2">
                <MetadataRow label="Prompt" value={commonPrompt || "N/A"} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="flex flex-col items-center bg-zinc-800/40 p-4 rounded-lg"
              >
                <div className="w-full h-auto aspect-square flex items-center justify-center">
                  <img
                    src={img.displayUrl || img.permanentUrl}
                    alt={img.prompt || `Image ${idx + 1}`}
                    className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-sm w-full">
                  <MetadataRow label="Seed" value={img.seed || "N/A"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompareModal;
