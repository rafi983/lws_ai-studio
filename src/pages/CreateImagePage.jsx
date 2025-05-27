import React, { useState, useEffect } from "react";
import PromptInput from "../components/PromptInput";
import AdvancedSettings from "../components/AdvancedSettings";
import ImageGrid from "../components/ImageGrid";
import PromptHistory from "../components/PromptHistory";
import { useImageGeneration } from "../context/ImageGenerationContext";
import { useDownloads } from "../context/DownloadsContext";
import toast from "react-hot-toast";

const CreateImagePage = () => {
  const { state, dispatch, generateImages } = useImageGeneration();
  const { dispatch: downloadDispatch } = useDownloads();

  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

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
        if (!modelList.some((m) => m.value === state.model)) {
          dispatch({
            type: "SET_MODEL",
            payload: modelList[0]?.value || "playground-v2.5",
          });
        }
      } catch (err) {
        toast.error("Could not fetch AI models.");
        setAvailableModels([
          { value: "playground-v2.5", label: "Playground V2.5 (Fallback)" },
        ]);
        dispatch({ type: "SET_MODEL", payload: "playground-v2.5" });
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, [dispatch, state.model]);

  const handlePromptChange = (e) => {
    dispatch({ type: "SET_PROMPT", payload: e.target.value });
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
    downloadDispatch({ type: "ADD_DOWNLOAD", payload: downloadPayload });
    toast.success("Download started!");
    fetch(image.permanentUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${image.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch(() => toast.error("Download failed."));
  };

  const handlePromptSelect = (selected) => {
    dispatch({ type: "SET_PROMPT", payload: selected });
  };

  const handlePromptClear = () => {
    dispatch({ type: "SET_HISTORY", payload: [] });
    localStorage.removeItem("lws-ai-prompt-history");
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">
        Let's create a masterpiece, Alvian! <span className="text-2xl">👋</span>
      </h2>

      <PromptHistory
        history={state.promptHistory}
        onSelect={handlePromptSelect}
        onClear={handlePromptClear}
      />

      <PromptInput
        prompt={state.prompt}
        onChange={handlePromptChange}
        onGenerate={generateImages}
        loading={state.loading}
        modelsLoading={modelsLoading}
      />

      <AdvancedSettings
        model={state.model}
        setModel={(value) => dispatch({ type: "SET_MODEL", payload: value })}
        availableModels={availableModels}
        modelsLoading={modelsLoading}
        seed={state.seed}
        setSeed={(value) => dispatch({ type: "SET_SEED", payload: value })}
        width={state.width}
        setWidth={(value) =>
          dispatch({
            type: "SET_DIMENSIONS",
            payload: { width: value, height: state.height },
          })
        }
        height={state.height}
        setHeight={(value) =>
          dispatch({
            type: "SET_DIMENSIONS",
            payload: { width: state.width, height: value },
          })
        }
        noLogo={state.noLogo}
        setNoLogo={(value) => dispatch({ type: "SET_NOLOGO", payload: value })}
      />

      <ImageGrid
        images={state.images}
        loading={state.loading}
        error={state.error}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default CreateImagePage;
