import React, { useState } from "react";
import usePollinations from "../hooks/usePollinations";
import ImageCard from "../components/ImageCard";
import { useDownloads } from "../context/DownloadsContext";

const CreateImagePage = () => {
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [settings, setSettings] = useState({
    width: 1024,
    height: 1024,
  });
  const [noLogo, setNoLogo] = useState(true);
  const [imageResults, setImageResults] = useState([]);

  const { loading, error, generateImages } = usePollinations();
  const { dispatch } = useDownloads();

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const setAspectRatio = (w, h) => {
    setSettings((prev) => ({ ...prev, width: w, height: h }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    setImageResults([]);
    // একটি নির্ভরযোগ্য মডেল এখানে হার্ডকোড করা হয়েছে
    const reliableModel = "playground-v2.5";

    const results = await generateImages({
      prompt,
      width: settings.width,
      height: settings.height,
      model: reliableModel,
      seed,
      noLogo,
    });
    setImageResults(results);
  };

  const handleDownload = (imageData) => {
    // এখানে আমরা ডাউনলোড করা ছবির জন্য একটি স্থায়ী URL তৈরি করার চেষ্টা করতে পারি,
    // কিন্তু blob থেকে এটি সরাসরি সম্ভব নয়। আপাতত, আমরা শুধু blob ডেটা সংরক্ষণ করছি।
    // ডাউনলোড করা ছবির গ্যালারি কাজ করার জন্য এই অংশটি ভবিষ্যতে আরও উন্নত করা যেতে পারে।
    dispatch({ type: "ADD_DOWNLOAD", payload: imageData });
  };

  return (
    <>
      <h2 className="text-4xl font-bold mb-8">
        Let's create a masterpiece! <span className="text-2xl">👋</span>
      </h2>

      <form onSubmit={handleSubmit}>
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
                ></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="A synthwave sports car..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="outline-none w-full py-4 px-2 bg-transparent text-white placeholder-zinc-400 text-lg"
            />
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 mr-1 rounded-full"
              disabled={loading}
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white transform rotate-90"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="border border-zinc-700/70 mb-6 rounded-lg p-4">
        <h4 className="font-medium mb-4">Advanced Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          <div>
            <label
              htmlFor="seed"
              className="block text-sm font-medium text-zinc-400 mb-1"
            >
              Seed (Optional)
            </label>
            <input
              type="number"
              id="seed"
              name="seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random"
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="width"
              className="block text-sm font-medium text-zinc-400 mb-1"
            >
              Width
            </label>
            <input
              type="number"
              name="width"
              value={settings.width}
              onChange={handleSettingsChange}
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="height"
              className="block text-sm font-medium text-zinc-400 mb-1"
            >
              Height
            </label>
            <input
              type="number"
              name="height"
              value={settings.height}
              onChange={handleSettingsChange}
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Aspect Ratio Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio(1024, 1024)}
                className="bg-zinc-900/10 px-3 py-2 text-xs hover:bg-zinc-800 rounded transition-colors"
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(1920, 1080)}
                className="bg-zinc-900/10 px-3 py-2 text-xs hover:bg-zinc-800 rounded transition-colors"
              >
                16:9
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(1024, 768)}
                className="bg-zinc-900/10 px-3 py-2 text-xs hover:bg-zinc-800 rounded transition-colors"
              >
                4:3
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(1280, 854)}
                className="bg-zinc-900/10 px-3 py-2 text-xs hover:bg-zinc-800 rounded transition-colors"
              >
                3:2
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="noLogo"
              className="block text-sm font-medium text-zinc-400 mb-2"
            >
              Remove Watermark
            </label>
            <label
              htmlFor="noLogo"
              className="relative inline-flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                id="noLogo"
                className="sr-only peer"
                checked={noLogo}
                onChange={() => setNoLogo(!noLogo)}
              />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-zinc-200 mb-4 font-bold text-lg">Result</h3>
        {loading && (
          <p className="text-center text-zinc-300">
            Generating your masterpieces... This might take a moment.
          </p>
        )}
        {error && <p className="text-center text-red-400">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {imageResults.map((result, index) =>
            result.status === "fulfilled" ? (
              <ImageCard
                key={index}
                imageBlob={result.value.imageBlob}
                prompt={result.value.prompt}
                onDownload={handleDownload}
              />
            ) : (
              <div
                key={index}
                className="w-full h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-center p-4"
              >
                <p className="text-red-400 text-sm">
                  Failed to generate image. <br /> {result.reason.message}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
};

export default CreateImagePage;
