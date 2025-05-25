import React, { useState, useEffect, useRef } from "react";
import ImageCard from "../components/ImageCard";
import CustomSelect from "../components/CustomSelect";
import ImageSkeleton from "../components/ImageSkeleton";
import { useDownloads } from "../context/DownloadsContext";

const modelOptions = [
  {
    label: "Recommended",
    options: [
      { value: "playground-v2.5", label: "Playground v2.5" },
      { value: "sdxl", label: "Stable Diffusion XL" },
      { value: "dall-e-3", label: "DALL-E 3" },
      { value: "flux-schnell", label: "Flux (Fast)" },
    ],
  },
  {
    label: "Artistic & Stylized",
    options: [
      { value: "openjourney", label: "OpenJourney" },
      { value: "waifu-diffusion", label: "Waifu Diffusion (Anime)" },
    ],
  },
  {
    label: "Photorealistic",
    options: [
      { value: "realistic-vision", label: "Realistic Vision" },
      { value: "absolute-reality", label: "Absolute Reality" },
    ],
  },
];

const loadInitialGeneratedData = () => {
  try {
    const data = localStorage.getItem("lws-ai-generated-data");
    if (data) {
      const parsedData = JSON.parse(data);
      if (parsedData.prompt && Array.isArray(parsedData.images)) {
        parsedData.images = parsedData.images.map((img) => ({
          ...img,
          displayUrl: img.permanentUrl,
        }));
        return parsedData;
      }
    }
  } catch (error) {
    console.error("Could not load generated data from local storage", error);
  }
  return { prompt: "", images: [], model: "playground-v2.5" };
};

const CreateImagePage = () => {
  const [initialData] = useState(loadInitialGeneratedData);
  const [prompt, setPrompt] = useState(initialData.prompt);
  const [images, setImages] = useState(initialData.images);
  const [model, setModel] = useState(initialData.model);

  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [seed, setSeed] = useState("");
  const [noLogo, setNoLogo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { dispatch } = useDownloads();
  const blobUrlsRef = useRef([]);

  useEffect(() => {
    try {
      const imagesToStore = images
        .filter((img) => !img.isLoading)
        .map(({ permanentUrl, prompt, model, seed }) => ({
          permanentUrl,
          prompt,
          model,
          seed,
        }));

      if (imagesToStore.length === 0 && initialData.images.length > 0) {
        return;
      }

      const currentData = { prompt, images: imagesToStore, model };
      localStorage.setItem(
        "lws-ai-generated-data",
        JSON.stringify(currentData),
      );
    } catch (error) {
      console.error("Could not save generated data to local storage", error);
    }
  }, [prompt, images, model, initialData.images]);

  const generateImages = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError(null);

    const skeletonArray = Array(9).fill({ isLoading: true });
    setImages(skeletonArray);

    blobUrlsRef.current.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    blobUrlsRef.current = [];

    const baseSeed = seed
      ? parseInt(seed, 10)
      : Math.floor(Math.random() * 1000000000);

    for (let i = 0; i < 9; i++) {
      const currentSeed = seed ? baseSeed : baseSeed + i;

      // --- THIS IS THE CRITICAL FIX ---
      // 1. Create the params object without the nologo parameter
      const params = new URLSearchParams({
        model,
        width,
        height,
        seed: currentSeed,
      });

      // 2. Only add the 'nologo' parameter if the switch is ON
      if (noLogo) {
        params.append("nologo", "true");
      }
      // --- END OF FIX ---

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;

      let resultObject = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const contentType = res.headers.get("Content-Type");
        if (!res.ok || !contentType?.startsWith("image/")) {
          throw new Error("Invalid image response");
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(blobUrl);

        resultObject = {
          displayUrl: blobUrl,
          permanentUrl: url,
          prompt: prompt,
          model: model,
          seed: currentSeed,
        };
      } catch (err) {
        console.warn(`❌ Failed to fetch image ${i + 1}:`, err.message);
      }

      setImages((currentImages) => {
        const newImages = [...currentImages];
        newImages[i] = resultObject;
        return newImages;
      });
    }

    setLoading(false);
  };

  const handleDownload = (image) => {
    const downloadPayload = {
      imageUrl: image.permanentUrl,
      prompt: image.prompt,
      model: image.model,
      seed: image.seed,
    };
    dispatch({ type: "ADD_DOWNLOAD", payload: downloadPayload });

    fetch(image.permanentUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${image.prompt.slice(0, 20)}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => console.error("Failed to download image:", err));
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
        Let's create a masterpiece, Alvian! <span className="text-2xl">👋</span>
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
          <CustomSelect
            label="Model"
            options={modelOptions}
            value={model}
            onChange={setModel}
          />

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

      {loading && images.every((img) => img.isLoading) && (
        <p className="text-center py-4 text-zinc-300">
          Generating images... Please wait.
        </p>
      )}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => {
          if (image?.isLoading) {
            return <ImageSkeleton key={`skeleton-${index}`} />;
          }
          if (image) {
            return (
              <ImageCard
                key={image.permanentUrl || index}
                image={image}
                onDownload={handleDownload}
              />
            );
          }
          return (
            <div
              key={`failed-${index}`}
              className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-center p-4"
            >
              <p className="text-red-400 text-sm">Failed to generate image.</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreateImagePage;
