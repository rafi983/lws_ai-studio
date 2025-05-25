import React from "react";

/**
 * A simple, reusable skeleton loader component that mimics the ImageCard's dimensions.
 * It uses Tailwind's animate-pulse to create a subtle loading effect.
 */
const ImageSkeleton = () => {
  return (
    <div className="w-full h-48 bg-zinc-800 rounded-xl animate-pulse"></div>
  );
};

export default ImageSkeleton;
