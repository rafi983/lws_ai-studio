import React, { useState, useEffect, useCallback } from "react";
import PromptInput from "../components/PromptInput";
import AdvancedSettings from "../components/AdvancedSettings";
import ImageGrid from "../components/ImageGrid";
import PromptHistory from "../components/PromptHistory";
import ImageModal from "../components/ImageModal";
import CanvasEditorModal from "../components/CanvasEditorModal"; // ✅ NEW
import { useImageGeneration } from "../context/ImageGenerationContext";
import { useDownloads } from "../context/DownloadsContext";
import { fetchAvailableModels } from "../api/pollinationsAPI";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../utils/toastUtils";

const CreateImagePage = () => {
  const { state, dispatch, generateImages } = useImageGeneration();
  const { dispatch: downloadDispatch } = useDownloads();

  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const [templatePrompts, setTemplatePrompts] = useState([]);
  const [usedTemplates, setUsedTemplates] = useState([]);
  const [aiPrompts, setAIPrompts] = useState([]);
  const [usedAIPrompts, setUsedAIPrompts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);

  const [editorImage, setEditorImage] = useState(null); // ✅ NEW

  useEffect(() => {
    const readyImages = state.images.filter(
      (img) => img.status === "ready" && (img.displayUrl || img.permanentUrl),
    );
    setModalImages(readyImages);
  }, [state.images]);

  useEffect(() => {
    (async () => {
      setModelsLoading(true);
      try {
        const modelList = await fetchAvailableModels();
        setAvailableModels(modelList);
        const isCurrentModelAvailable = modelList.some(
          (m) => m.value === state.model,
        );
        if (!isCurrentModelAvailable && modelList.length > 0) {
          dispatch({
            type: "SET_MODEL",
            payload: modelList[0]?.value || "playground-v2.5",
          });
        } else if (!isCurrentModelAvailable && modelList.length === 0) {
          dispatch({ type: "SET_MODEL", payload: "playground-v2.5" });
        }
      } catch (err) {
        showErrorToast(String(err.message || "Failed to fetch models."));
        setAvailableModels([
          { value: "playground-v2.5", label: "Playground V2.5 (Fallback)" },
        ]);
        if (state.model !== "playground-v2.5")
          dispatch({ type: "SET_MODEL", payload: "playground-v2.5" });
      } finally {
        setModelsLoading(false);
      }
    })();
  }, [dispatch, state.model]);

  useEffect(() => {
    const fetchJsonData = async (url, setData, name) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        setData(data);
      } catch (error) {
        showErrorToast(`Failed to load ${name}.`);
      }
    };
    fetchJsonData("/prompts.json", setTemplatePrompts, "templates");
    fetchJsonData("/generated-prompts.json", setAIPrompts, "AI prompts");
  }, []);

  const handlePromptChange = (e) => {
    const value = e.target.value;
    dispatch({ type: "SET_PROMPT", payload: value });

    if (value.trim() === "") {
      dispatch({ type: "SET_IMAGES", payload: [] });
      dispatch({ type: "FINISH_LOADING" });
    }
  };

  const handleRandomPromptSelection = (prompts, used, setUsed, type) => {
    if (prompts.length === 0) {
      showErrorToast(`${type} are not loaded yet.`);
      return;
    }
    let remaining = prompts.filter((p) => !used.includes(p));
    if (remaining.length === 0) {
      setUsed([]);
      remaining = prompts;
      showWarningToast(`All ${type} used. Resetting the list. Pick again!`);
      if (remaining.length === 0) {
        showErrorToast(`No ${type} available to select.`);
        return;
      }
    }
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    setUsed((prev) => [...prev, random]);
    dispatch({ type: "SET_PROMPT", payload: random });
    showSuccessToast(
      `${type === "Templates" ? "Template" : "AI Prompt"} inserted: ${random.substring(0, 30)}...`,
    );
  };

  const handleTemplatesClick = () =>
    handleRandomPromptSelection(
      templatePrompts,
      usedTemplates,
      setUsedTemplates,
      "Templates",
    );

  const handleGeneratePromptsClick = () =>
    handleRandomPromptSelection(
      aiPrompts,
      usedAIPrompts,
      setUsedAIPrompts,
      "AI Prompts",
    );

  const handleDownload = useCallback(
    (image) => {
      if (!image || !image.permanentUrl) {
        showErrorToast("Cannot download: Image data is incomplete.");
        return;
      }
      const downloadPayload = {
        id: image.id || image.permanentUrl,
        permanentUrl: image.permanentUrl,
        displayUrl: image.displayUrl || image.permanentUrl,
        prompt: image.prompt || "Untitled",
        model: image.model || "Unknown",
        seed: image.seed || "N/A",
        width: image.width || 0,
        height: image.height || 0,
        status: image.status || "ready",
      };
      downloadDispatch({ type: "ADD_DOWNLOAD", payload: downloadPayload });
      fetch(image.permanentUrl)
        .then((res) => {
          if (!res.ok)
            throw new Error(`Failed to fetch image: ${res.statusText}`);
          return res.blob();
        })
        .then((blob) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          const safePrompt = (image.prompt || "ai_image")
            .slice(0, 30)
            .replace(/[^a-zA-Z0-9]/g, "_");
          a.download = `${safePrompt}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          showSuccessToast("Image download initiated!");
        })
        .catch((err) => {
          showErrorToast(`Download failed: ${err.message}`);
        });
    },
    [downloadDispatch],
  );

  const handlePromptSelect = (selected) => {
    dispatch({ type: "SET_PROMPT", payload: selected });
  };

  const handlePromptClear = () => {
    dispatch({ type: "SET_HISTORY", payload: [] });
    localStorage.removeItem("lws-ai-prompt-history");
    showSuccessToast("Prompt history cleared.");
  };

  const openModalWithImage = (originalImageIndex) => {
    const clickedImage = state.images[originalImageIndex];
    const indexInModalImages = modalImages.findIndex(
      (img) =>
        (img.id && img.id === clickedImage.id) ||
        img.permanentUrl === clickedImage.permanentUrl,
    );
    if (indexInModalImages !== -1) {
      setCurrentModalImageIndex(indexInModalImages);
      setIsModalOpen(true);
    } else {
      showErrorToast("This image is not ready for preview yet.");
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const goToNextImage = () => {
    if (modalImages.length === 0) return;
    setCurrentModalImageIndex(
      (prevIndex) => (prevIndex + 1) % modalImages.length,
    );
  };

  const goToPreviousImage = () => {
    if (modalImages.length === 0) return;
    setCurrentModalImageIndex(
      (prevIndex) => (prevIndex - 1 + modalImages.length) % modalImages.length,
    );
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8">
        Let's create a masterpiece, Alvian!{" "}
        <span className="text-2xl animate-wave inline-block">👋</span>
      </h2>
      <style jsx global>{`
        @keyframes wave-animation {
          0% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
          60% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-wave {
          display: inline-block;
          animation: wave-animation 2.5s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>

      <PromptHistory
        history={state.promptHistory}
        onSelect={handlePromptSelect}
        onClear={handlePromptClear}
      />

      <PromptInput
        prompt={state.prompt}
        onChange={handlePromptChange}
        onGenerate={generateImages}
        loading={
          state.loading &&
          state.images.some(
            (img) => img.status === "loading" || img.status === "queued",
          )
        }
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
        loading={
          state.loading && state.images.every((img) => img.status === "queued")
        }
        error={state.error}
        onDownload={handleDownload}
        onImageClick={openModalWithImage}
        onEdit={(img) => setEditorImage(img)} // ✅ canvas editor hook
      />

      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={modalImages}
        currentIndex={currentModalImageIndex}
        onPrev={goToPreviousImage}
        onNext={goToNextImage}
        onSelect={(index) => setCurrentModalImageIndex(index)}
      />

      {editorImage && (
        <CanvasEditorModal
          image={editorImage}
          onClose={() => setEditorImage(null)}
        />
      )}
    </div>
  );
};

export default CreateImagePage;
