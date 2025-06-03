import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PromptInput from "../components/PromptInput";
import AdvancedSettings from "../components/AdvancedSettings";
import ImageGrid from "../components/ImageGrid";
import PromptHistory from "../components/PromptHistory";
import { useImageGeneration } from "../context/ImageGenerationContext";
import { useDownloads } from "../context/DownloadsContext";
import { fetchAvailableModels } from "../api/pollinationsAPI";

const CreateImagePage = () => {
  const { state, dispatch, generateImages } = useImageGeneration();
  const { dispatch: downloadDispatch } = useDownloads();

  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const [templatePrompts, setTemplatePrompts] = useState([]);
  const [usedTemplates, setUsedTemplates] = useState([]);
  const [aiPrompts, setAIPrompts] = useState([]);
  const [usedAIPrompts, setUsedAIPrompts] = useState([]);

  // Fetch models on load
  useEffect(() => {
    (async () => {
      setModelsLoading(true);
      try {
        const modelList = await fetchAvailableModels();
        setAvailableModels(modelList);
        const isCurrentModelAvailable = modelList.some(
          (m) => m.value === state.model,
        );
        if (!isCurrentModelAvailable) {
          dispatch({
            type: "SET_MODEL",
            payload: modelList[0]?.value || "playground-v2.5",
          });
        }
      } catch (err) {
        toast.error(err.message);
        setAvailableModels([
          { value: "playground-v2.5", label: "Playground V2.5 (Fallback)" },
        ]);
        dispatch({ type: "SET_MODEL", payload: "playground-v2.5" });
      } finally {
        setModelsLoading(false);
      }
    })();
  }, [dispatch, state.model]);

  // Fetch template prompts
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/prompts.json");
        const data = await response.json();
        setTemplatePrompts(data);
      } catch (error) {
        console.error("Error fetching template prompts:", error);
        toast.error("Failed to load templates.");
      }
    };
    fetchTemplates();
  }, []);

  // Fetch AI-generated prompts
  useEffect(() => {
    const fetchAIPrompts = async () => {
      try {
        const response = await fetch("/generated-prompts.json");
        const data = await response.json();
        setAIPrompts(data);
      } catch (error) {
        console.error("Error fetching AI prompts:", error);
        toast.error("Failed to load AI prompts.");
      }
    };
    fetchAIPrompts();
  }, []);

  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    dispatch({ type: "SET_PROMPT", payload: newPrompt });

    if (newPrompt.trim() === "") {
      dispatch({ type: "SET_IMAGES", payload: [] }); // Clear images
      dispatch({ type: "FINISH_LOADING" }); // Stop loading spinner
      dispatch({ type: "SET_ERROR", payload: null }); // Clear error
    }
  };

  const handleTemplatesClick = () => {
    const remaining = templatePrompts.filter((p) => !usedTemplates.includes(p));
    if (remaining.length === 0) {
      setUsedTemplates([]);
      toast.info("All templates used. Resetting the list.");
      return;
    }
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    setUsedTemplates((prev) => [...prev, random]);
    dispatch({ type: "SET_PROMPT", payload: random });
    toast.success(`Template inserted: ${random}`);
  };

  const handleGeneratePromptsClick = () => {
    const remaining = aiPrompts.filter((p) => !usedAIPrompts.includes(p));
    if (remaining.length === 0) {
      setUsedAIPrompts([]);
      toast.info("All AI prompts used. Resetting the list.");
      return;
    }
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    setUsedAIPrompts((prev) => [...prev, random]);
    dispatch({ type: "SET_PROMPT", payload: random });
    toast.success("AI generated a new prompt!");
  };

  const handleDownload = (image) => {
    const downloadPayload = {
      id: image.id,
      permanentUrl: image.permanentUrl,
      displayUrl: image.displayUrl || image.permanentUrl,
      prompt: image.prompt,
      model: image.model,
      seed: image.seed,
      width: image.width,
      height: image.height,
      status: image.status || "ready",
    };

    downloadDispatch({ type: "ADD_DOWNLOAD", payload: downloadPayload });

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
        onTemplatesClick={handleTemplatesClick}
        onGeneratePromptsClick={handleGeneratePromptsClick}
      />

      <AdvancedSettings
        model={state.model}
        setModel={(value) => dispatch({ type: "SET_MODEL", payload: value })}
        availableModels={availableModels}
        modelsLoading={modelsLoading}
        seed={state.seed}
        setSeed={(value) => dispatch({ type: "SET_SEED", payload: value })}
        width={state.width}
        height={state.height}
        setDimensions={(width, height) =>
          dispatch({ type: "SET_DIMENSIONS", payload: { width, height } })
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
