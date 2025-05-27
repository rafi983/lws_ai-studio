// src/pages/DownloadedPage.jsx

import React from "react";
import { useDownloads } from "../context/DownloadsContext.jsx";
import ImageCard from "../components/ImageCard";

const DownloadedPage = () => {
  const { state } = useDownloads();

  return (
    <>
      <h2 className="text-4xl font-bold mb-8">
        Your Downloads <span className="text-2xl">🖼️</span>
      </h2>

      {state.downloads.length === 0 ? (
        <p className="text-zinc-400 text-center mt-12">
          You haven't downloaded any images yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {state.downloads.map((image) => (
            <ImageCard
              // FIX: Use the consistent, unique permanentUrl as the key
              key={image.permanentUrl}
              image={image}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default DownloadedPage;
