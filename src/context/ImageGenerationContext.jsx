import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { generateImageFromApi } from "../api/pollinationsAPI";

const ImageGenerationContext = createContext();

const initialState = {
  prompt: "",
  images: [],
  promptHistory: [],
  model: "playground-v2.5",
  width: 1024,
  height: 1024,
  seed: "",
  noLogo: true,
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PROMPT":
      return {
        ...state,
        prompt: action.payload,
        images: state.loading ? state.images : [],
      };
    case "SET_MODEL":
      return { ...state, model: action.payload };
    case "SET_DIMENSIONS":
      return {
        ...state,
        width: action.payload.width,
        height: action.payload.height,
      };
    case "SET_SEED":
      return { ...state, seed: action.payload };
    case "SET_NOLOGO":
      return { ...state, noLogo: action.payload };
    case "START_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
        images: Array(9).fill({ isLoading: true }),
      };
    case "SET_IMAGE":
      const updatedImages = [...state.images];
      updatedImages[action.index] = action.payload;
      return { ...state, images: updatedImages };
    case "FINISH_LOADING":
      return { ...state, loading: false };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_HISTORY":
      return { ...state, promptHistory: action.payload };
    case "ADD_TO_HISTORY":
      const updatedHistory = [
        action.payload,
        ...state.promptHistory.filter(
          (item) => item.prompt !== action.payload.prompt,
        ),
      ].slice(0, 20);
      localStorage.setItem(
        "lws-ai-prompt-history",
        JSON.stringify(updatedHistory),
      );
      return { ...state, promptHistory: updatedHistory };
    case "LOAD_SAVED":
      return { ...state, ...action.payload, loading: false };
    default:
      return state;
  }
};

export const ImageGenerationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const blobUrlsRef = useRef([]);

  useEffect(() => {
    const savedData = localStorage.getItem("lws-ai-generated-data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.prompt !== undefined && Array.isArray(parsed.images)) {
          parsed.images = parsed.images.map((img) => {
            if (img) return { ...img, displayUrl: img.permanentUrl };
            return null;
          });
          dispatch({ type: "LOAD_SAVED", payload: parsed });
        }
      } catch (err) {
        console.error("Could not load generated data from local storage", err);
      }
    }

    const savedHistory = localStorage.getItem("lws-ai-prompt-history");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        dispatch({ type: "SET_HISTORY", payload: parsedHistory });
      } catch (err) {
        console.error("Could not load prompt history from local storage", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!state.loading && state.images.length > 0) {
      try {
        const imagesToStore = state.images
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
          JSON.stringify({
            prompt: state.prompt,
            images: imagesToStore,
            model: state.model,
          }),
        );
      } catch (error) {
        console.error("Could not save generated data to local storage", error);
      }
    }
  }, [state.prompt, state.images, state.model, state.loading]);

  const generateImages = async () => {
    if (!state.prompt.trim()) {
      toast.error("Please enter a prompt!");
      return;
    }

    dispatch({ type: "START_LOADING" });
    const loadingToastId = toast.loading("Generating images...");

    blobUrlsRef.current.forEach((url) => url && URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    const baseSeed = state.seed
      ? parseInt(state.seed, 10)
      : Math.floor(Math.random() * 1000000000);

    let successCount = 0;

    for (let i = 0; i < 9; i++) {
      const currentSeed = state.seed ? baseSeed : baseSeed + i;
      let resultObject = null;

      try {
        resultObject = await generateImageFromApi({
          prompt: state.prompt,
          model: state.model,
          width: state.width,
          height: state.height,
          seed: currentSeed,
          noLogo: state.noLogo,
        });
        blobUrlsRef.current.push(resultObject.displayUrl);
        successCount++;
      } catch (err) {
        console.warn(`❌ Failed to fetch image ${i + 1}:`, err.message);
      }

      dispatch({ type: "SET_IMAGE", index: i, payload: resultObject });

      if (i === 0 && resultObject) {
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: { prompt: state.prompt, imageUrl: resultObject.displayUrl },
        });
      }
    }

    dispatch({ type: "FINISH_LOADING" });
    toast.dismiss(loadingToastId);

    if (successCount > 0) {
      toast.success(
        `Generated ${successCount} image${successCount > 1 ? "s" : ""}!`,
      );
    } else {
      toast.error("Failed to generate images.");
    }
  };

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <ImageGenerationContext.Provider
      value={{ state, dispatch, generateImages }}
    >
      {children}
    </ImageGenerationContext.Provider>
  );
};

export const useImageGeneration = () => useContext(ImageGenerationContext);
