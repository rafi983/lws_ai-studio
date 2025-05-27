import React, { useState, useEffect, useRef } from "react";
import PromptInput from "../components/PromptInput";
import AdvancedSettings from "../components/AdvancedSettings";
import ImageGrid from "../components/ImageGrid";
import PromptHistory from "../components/PromptHistory";
import { useDownloads } from "../context/DownloadsContext";
import toast from "react-hot-toast";

const loadInitialGeneratedData = () => {
  try {
    const data = localStorage.getItem("lws-ai-generated-data");
    if (data) {
      const parsedData = JSON.parse(data);
      if (parsedData.prompt !== undefined && Array.isArray(parsedData.images)) {
        parsedData.images = parsedData.images.map((img) => {
          if (img) return { ...img, displayUrl: img.permanentUrl };
          return null;
        });
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
  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [seed, setSeed] = useState("");
  const [noLogo, setNoLogo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lws-ai-prompt-history")) || [];
    } catch {
      return [];
    }
  });

  const { dispatch } = useDownloads();
  const blobUrlsRef = useRef([]);
  const [userChangedPrompt, setUserChangedPrompt] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await fetch("https://image.pollinations.ai/models");
        const data = await response.json();
        const modelList = data.map((modelName) => ({
          value: modelName,
          label: modelName
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }));
        setAvailableModels(modelList);
        if (!modelList.some((m) => m.value === model)) {
          setModel(modelList[0]?.value || "playground-v2.5");
        }
      } catch (err) {
        console.error("Error fetching models:", err);
        toast.error("Could not fetch AI models. Using fallback.");
        setAvailableModels([
          { value: "playground-v2.5", label: "Playground V2.5 (Fallback)" },
        ]);
        setModel("playground-v2.5");
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        const imagesToStore = images
          .map((img) => {
            if (img && !img.isLoading)
              return {
                permanentUrl: img.permanentUrl,
                prompt: img.prompt,
                model: img.model,
                seed: img.seed,
                width: img.width,
                height: img.height,
              };
            if (img === null) return null;
            return undefined;
          })
          .filter((img) => img !== undefined);
        localStorage.setItem(
          "lws-ai-generated-data",
          JSON.stringify({ prompt, images: imagesToStore, model }),
        );
      } catch (error) {
        console.error("Could not save generated data to local storage", error);
      }
    }
  }, [prompt, images, model, loading]);

  useEffect(() => {
    if (userChangedPrompt) setImages([]);
  }, [prompt, userChangedPrompt]);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    setUserChangedPrompt(true);
  };

  const handleSelectPrompt = (selected) => {
    setPrompt(selected);
  };

  const handleClearHistory = () => {
    setPromptHistory([]);
    localStorage.removeItem("lws-ai-prompt-history");
  };

  const generateImages = async () => {
    console.log(`Generating image with width: ${width}, height: ${height}`);

    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    setUserChangedPrompt(false);
    const loadingToast = toast.loading("Conjuring up your masterpiece...");
    setLoading(true);
    setError(null);
    setImages(Array(9).fill({ isLoading: true }));

    blobUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    const baseSeed = seed
      ? parseInt(seed, 10)
      : Math.floor(Math.random() * 1000000000);

    for (let i = 0; i < 9; i++) {
      const currentSeed = seed ? baseSeed : baseSeed + i;
      const params = new URLSearchParams({
        model,
        width,
        height,
        seed: currentSeed,
      });
      if (noLogo) params.append("nologo", "true");
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt,
      )}?${params.toString()}`;

      let resultObject = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok || !res.headers.get("Content-Type")?.startsWith("image/"))
          throw new Error("Invalid image response");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(blobUrl);
        resultObject = {
          displayUrl: blobUrl,
          permanentUrl: url,
          prompt,
          model,
          seed: currentSeed,
          width,
          height,
        };
      } catch (err) {
        console.warn(`❌ Failed to fetch image ${i + 1}:`, err.message);
      }
      setImages((current) => {
        const newImages = [...current];
        newImages[i] = resultObject;
        return newImages;
      });
    }

    // Update prompt history with first image preview
    const updatedHistory = [
      { prompt: prompt.trim(), imageUrl: blobUrlsRef.current[0] },
      ...promptHistory.filter((item) => item.prompt !== prompt.trim()),
    ].slice(0, 20);

    setPromptHistory(updatedHistory);
    localStorage.setItem(
      "lws-ai-prompt-history",
      JSON.stringify(updatedHistory),
    );

    toast.dismiss(loadingToast);
    toast.success("Images generated successfully!");
    setLoading(false);
  };

  const handleDownload = (image) => {
    const downloadPayload = {
      imageUrl: image.permanentUrl,
      prompt: image.prompt,
      model: image.model,
      seed: image.seed,
      width: image.width,
      height: image.height,
    };
    dispatch({ type: "ADD_DOWNLOAD", payload: downloadPayload });
    toast.success("Download started!");
    fetch(image.permanentUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${image.prompt
          .slice(0, 20)
          .replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => {
        toast.error("Download failed.");
        console.error("Failed to download image:", err);
      });
  };

  useEffect(
    () => () =>
      blobUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url)),
    [],
  );

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">
        Let's create a masterpiece, Alvian! <span className="text-2xl">👋</span>
      </h2>

      <PromptHistory
        history={promptHistory}
        onSelect={handleSelectPrompt}
        onClear={handleClearHistory}
      />

      <PromptInput
        prompt={prompt}
        onChange={handlePromptChange}
        onGenerate={generateImages}
        loading={loading}
        modelsLoading={modelsLoading}
      />

      <AdvancedSettings
        model={model}
        setModel={setModel}
        availableModels={availableModels}
        modelsLoading={modelsLoading}
        seed={seed}
        setSeed={setSeed}
        width={width}
        setWidth={setWidth}
        height={height}
        setHeight={setHeight}
        noLogo={noLogo}
        setNoLogo={setNoLogo}
      />

      <ImageGrid
        images={images}
        loading={loading}
        error={error}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default CreateImagePage;
