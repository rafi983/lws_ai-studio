import React, { useState, useEffect } from "react";

const ImageCard = ({ imageBlob, prompt, onDownload }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (imageBlob) {
      const localUrl = URL.createObjectURL(imageBlob);
      setImageUrl(localUrl);

      return () => {
        URL.revokeObjectURL(localUrl);
      };
    }
  }, [imageBlob]);

  const handleDownload = async () => {
    if (!imageBlob) return;
    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = imageUrl;

      const filename = `${prompt.slice(0, 30).replace(/\s/g, "_")}.jpg`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onDownload) {
        // Downloaded page এর জন্য একটি স্থায়ী URL দরকার যা blob URL থেকে পাওয়া সম্ভব নয়
        // তাই আমরা শুধু প্রম্পট এবং একটি blob URL এর placeholder পাঠাতে পারি
        // অথবা একটি স্থায়ী URL জেনারেট করার জন্য ভিন্ন পদ্ধতি নিতে হবে
        // আপাতত, ডাউনলোড তালিকায় যোগ করার কার্যকারিতাটি সরল রাখা হলো
        onDownload({ imageBlob, prompt });
      }
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Could not download the image.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (hasError || !imageUrl) {
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
        onClick={handleDownload}
        title="Download Image"
      >
        {isDownloading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
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
        )}
      </div>
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs break-words">
        {prompt}
      </div>
      <img
        src={imageUrl}
        alt={prompt}
        className="w-full h-48 object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default ImageCard;
