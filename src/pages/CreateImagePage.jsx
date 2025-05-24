import React, { useState, useEffect, useRef } from "react";
import ImageCard from "../components/ImageCard";
import { useDownloads } from "../context/DownloadsContext";

const CreateImagePage = () => {
  const [prompt, setPrompt] = useState("");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [seed, setSeed] = useState("");
  const [noLogo, setNoLogo] = useState(true);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { dispatch } = useDownloads();
  const blobUrlsRef = useRef([]);

  const generateImages = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]);

    // Cleanup old blobs
    blobUrlsRef.current.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    blobUrlsRef.current = [];

    const model = "playground-v2.5"; // Fixed model
    const baseSeed = seed
      ? parseInt(seed, 10)
      : Math.floor(Math.random() * 1000000000);

    console.log("🌱 Seed Lock Mode:", seed ? "ON" : "AUTO");
    console.log("🖼️ Starting image generation...");

    for (let i = 0; i < 9; i++) {
      const currentSeed = seed ? baseSeed : baseSeed + i;

      const params = new URLSearchParams({
        model,
        width,
        height,
        seed: currentSeed,
        nologo: String(noLogo),
      });

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
      console.log(`👉 Fetching image ${i + 1}/9:`, url);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const contentType = res.headers.get("Content-Type");
        if (!res.ok || !contentType?.startsWith("image/")) {
          console.warn(
            `❌ Invalid response for image ${i + 1}:`,
            res.status,
            contentType,
          );
          throw new Error("Invalid image response");
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(blobUrl);
      } catch (err) {
        console.warn(`❌ Failed to fetch image ${i + 1}:`, err.message);
        blobUrlsRef.current.push(null);
      }
    }

    setImages([...blobUrlsRef.current]);
    setLoading(false);
  };

  const handleDownload = (url) => {
    dispatch({ type: "ADD_DOWNLOAD", payload: url });
  };

  const ratioPresets = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1920, height: 1080 },
    "4:3": { width: 1440, height: 1080 },
    "3:2": { width: 1620, height: 1080 },
  };

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">
        Let's create a masterpiece! <span className="text-2xl">👋</span>
      </h2>

      <div className="relative mb-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900/10 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="pl-5 pr-2">
            <svg
              className="w-5 h-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="A synthwave sports car..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && generateImages()}
            className="outline-none w-full py-4 px-2 bg-transparent text-white placeholder-zinc-400 text-lg"
          />
          <button
            onClick={generateImages}
            disabled={loading}
            className="bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 mr-1 rounded-full disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="animate-spin h-6 w-6 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white transform rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="border border-zinc-700/70 mb-6 rounded-lg p-4">
        <h4 className="font-medium mb-4">Advanced Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Model
            </label>
            <input
              disabled
              value="playground-v2.5 (auto-selected)"
              className="w-full bg-zinc-900/10 px-3 py-2 text-zinc-500 border border-zinc-700/70 rounded-md cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Seed (Optional)
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Width
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Height
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Aspect Ratio Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ratioPresets).map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => {
                    setWidth(val.width);
                    setHeight(val.height);
                  }}
                  className="bg-zinc-900/10 px-3 py-2 text-xs hover:bg-zinc-800 rounded transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Remove Watermark
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={noLogo}
                onChange={() => setNoLogo(!noLogo)}
              />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-center py-4 text-zinc-300">
          Generating images... Please wait up to 1 minute per image.
        </p>
      )}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) =>
          url ? (
            <ImageCard
              key={index}
              img={url}
              onDownload={() => handleDownload(url)}
            />
          ) : (
            <div
              key={index}
              className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-center p-4"
            >
              <p className="text-red-400 text-sm">Failed to generate image.</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default CreateImagePage;
