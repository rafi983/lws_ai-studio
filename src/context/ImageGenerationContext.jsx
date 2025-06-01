import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { generateImageFromApi } from "../api/pollinationsAPI";

const ActionTypes = {
  SET_PROMPT: "SET_PROMPT",
  SET_MODEL: "SET_MODEL",
  SET_DIMENSIONS: "SET_DIMENSIONS",
  SET_SEED: "SET_SEED",
  SET_NOLOGO: "SET_NOLOGO",
  START_LOADING: "START_LOADING",
  SET_IMAGE: "SET_IMAGE",
  FINISH_LOADING: "FINISH_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_HISTORY: "SET_HISTORY",
  ADD_TO_HISTORY: "ADD_TO_HISTORY",
  LOAD_SAVED: "LOAD_SAVED",
};

const ImageGenerationContext = createContext();

const NUM_IMAGES_TO_GENERATE = 9;
const MAX_HISTORY_ITEMS = 20;
const LOCAL_STORAGE_GENERATED_DATA_KEY = "lws-ai-generated-data";
const LOCAL_STORAGE_PROMPT_HISTORY_KEY = "lws-ai-prompt-history";

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

const showWarningToast = (message) => {
  toast(message, {
    icon: "⚠️",
    style: {
      background: "#facc15",
      color: "#000",
    },
  });
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROMPT:
      return {
        ...state,
        prompt: action.payload,
        images: state.loading ? state.images : [],
      };
    case ActionTypes.SET_MODEL:
      return { ...state, model: action.payload };
    case ActionTypes.SET_DIMENSIONS:
      return {
        ...state,
        width: action.payload.width,
        height: action.payload.height,
      };
    case ActionTypes.SET_SEED:
      return { ...state, seed: action.payload };
    case ActionTypes.SET_NOLOGO:
      return { ...state, noLogo: action.payload };
    case ActionTypes.START_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
        images: Array(NUM_IMAGES_TO_GENERATE).fill({ isLoading: true }),
      };
    case ActionTypes.SET_IMAGE: {
      const { index, payload } = action;
      if (
        typeof index !== "number" ||
        index < 0 ||
        !state.images ||
        index >= state.images.length
      ) {
        toast.error(
          `Internal error: Could not update image at index ${index}.`,
        );
        return state;
      }
      const updatedImages = [...state.images];
      updatedImages[index] = payload;
      return { ...state, images: updatedImages };
    }
    case ActionTypes.FINISH_LOADING:
      return { ...state, loading: false };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.SET_HISTORY:
      return {
        ...state,
        promptHistory: Array.isArray(action.payload) ? action.payload : [],
      };
    case ActionTypes.ADD_TO_HISTORY: {
      const newEntry = action.payload;
      if (!newEntry || typeof newEntry.prompt !== "string") {
        return state;
      }
      const currentHistory = Array.isArray(state.promptHistory)
        ? state.promptHistory
        : [];
      const updatedHistory = [
        newEntry,
        ...currentHistory.filter(
          (item) =>
            item &&
            typeof item.prompt === "string" &&
            item.prompt !== newEntry.prompt,
        ),
      ].slice(0, MAX_HISTORY_ITEMS);
      return { ...state, promptHistory: updatedHistory };
    }
    case ActionTypes.LOAD_SAVED: {
      const loadedData = { ...action.payload };
      if (loadedData.model === "gptimg") {
        loadedData.model = initialState.model;
      }
      return {
        ...state,
        ...loadedData,
        loading: false,
        error: null,
      };
    }
    default:
      return state;
  }
};

export const ImageGenerationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const blobUrlsRef = useRef([]);

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_GENERATED_DATA_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (
          parsed &&
          typeof parsed.prompt === "string" &&
          Array.isArray(parsed.images)
        ) {
          parsed.images = parsed.images.map((img) => {
            if (img && img.permanentUrl)
              return { ...img, displayUrl: img.permanentUrl };
            return null;
          });
          dispatch({ type: ActionTypes.LOAD_SAVED, payload: parsed });
        } else {
          showWarningToast(
            "Previously saved image data was malformed and has been cleared.",
          );
          localStorage.removeItem(LOCAL_STORAGE_GENERATED_DATA_KEY);
        }
      } catch (err) {
        toast.error(
          `Error loading saved image data: ${err.message}. Data has been cleared.`,
        );
        localStorage.removeItem(LOCAL_STORAGE_GENERATED_DATA_KEY);
      }
    }

    const savedHistory = localStorage.getItem(LOCAL_STORAGE_PROMPT_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          const validatedHistory = parsedHistory.filter(
            (item) =>
              item &&
              typeof item.prompt === "string" &&
              typeof item.imageUrl === "string",
          );
          dispatch({
            type: ActionTypes.SET_HISTORY,
            payload: validatedHistory,
          });
        } else {
          showWarningToast(
            "Previously saved prompt history was malformed and has been cleared.",
          );
          localStorage.removeItem(LOCAL_STORAGE_PROMPT_HISTORY_KEY);
          dispatch({ type: ActionTypes.SET_HISTORY, payload: [] });
        }
      } catch (err) {
        toast.error(
          `Error loading prompt history: ${err.message}. History has been cleared.`,
        );
        localStorage.removeItem(LOCAL_STORAGE_PROMPT_HISTORY_KEY);
        dispatch({ type: ActionTypes.SET_HISTORY, payload: [] });
      }
    } else {
      dispatch({ type: ActionTypes.SET_HISTORY, payload: [] });
    }
  }, []);

  useEffect(() => {
    if (
      !state.loading &&
      Array.isArray(state.images) &&
      state.images.length > 0 &&
      state.images.some((img) => img && !img.isLoading)
    ) {
      try {
        const imagesToStore = state.images
          .map((img) => {
            if (img && !img.isLoading && img.permanentUrl) {
              return {
                id: img.id,
                permanentUrl: img.permanentUrl,
                prompt: img.prompt,
                model: img.model,
                seed: img.seed,
                width: img.width,
                height: img.height,
              };
            }
            if (img === null) return null;
            return undefined;
          })
          .filter((img) => typeof img !== "undefined");

        if (
          imagesToStore.length > 0 ||
          imagesToStore.some((img) => img === null)
        ) {
          localStorage.setItem(
            LOCAL_STORAGE_GENERATED_DATA_KEY,
            JSON.stringify({
              prompt: state.prompt,
              images: imagesToStore,
              model: state.model,
            }),
          );
        }
      } catch (error) {
        toast.error(
          `Could not save image data to local storage: ${error.message}`,
        );
      }
    }
  }, [state.prompt, state.images, state.model, state.loading]);

  useEffect(() => {
    if (Array.isArray(state.promptHistory)) {
      try {
        if (state.promptHistory.length > 0) {
          localStorage.setItem(
            LOCAL_STORAGE_PROMPT_HISTORY_KEY,
            JSON.stringify(state.promptHistory),
          );
        } else if (localStorage.getItem(LOCAL_STORAGE_PROMPT_HISTORY_KEY)) {
          localStorage.setItem(
            LOCAL_STORAGE_PROMPT_HISTORY_KEY,
            JSON.stringify([]),
          );
        }
      } catch (error) {
        toast.error(`Failed to save prompt history: ${error.message}`);
      }
    }
  }, [state.promptHistory]);

  const generateImages = useCallback(async () => {
    if (!state.prompt.trim()) {
      toast.error("Please enter a prompt!");
      return;
    }

    if (state.model === "gptimg") {
      toast.error(
        "The model 'gptimg' is currently unavailable or restricted. Please select another model.",
      );
      dispatch({ type: ActionTypes.SET_MODEL, payload: initialState.model });
      return;
    }

    dispatch({ type: ActionTypes.START_LOADING });
    const loadingToastId = toast.loading(
      `Generating ${NUM_IMAGES_TO_GENERATE} images...`,
    );

    blobUrlsRef.current.forEach((url) => {
      if (url && typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    blobUrlsRef.current = [];

    const baseSeed =
      state.seed && !isNaN(parseInt(state.seed, 10))
        ? parseInt(state.seed, 10)
        : Math.floor(Math.random() * 1000000000);

    let successCount = 0;
    const newBlobUrls = [];

    for (let i = 0; i < NUM_IMAGES_TO_GENERATE; i++) {
      const currentSeed =
        state.seed && !isNaN(parseInt(state.seed, 10))
          ? baseSeed
          : baseSeed + i;
      let imageResult = null;

      try {
        const apiResponse = await generateImageFromApi({
          prompt: state.prompt,
          model: state.model,
          width: state.width,
          height: state.height,
          seed: currentSeed,
          noLogo: state.noLogo,
        });

        if (apiResponse && apiResponse.displayUrl) {
          imageResult = {
            id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
            prompt: state.prompt,
            model: state.model,
            seed: currentSeed,
            width: state.width,
            height: state.height,
            displayUrl: apiResponse.displayUrl,
            permanentUrl: apiResponse.permanentUrl || apiResponse.displayUrl,
          };

          if (imageResult.displayUrl.startsWith("blob:")) {
            newBlobUrls.push(imageResult.displayUrl);
          }
          successCount++;
        } else {
          showWarningToast(
            `Image ${i + 1} generation did not return a valid result.`,
          );
        }
      } catch (err) {
        showWarningToast(
          `Failed to fetch image ${i + 1}: ${err.message || "Unknown error"}`,
        );
      }

      dispatch({
        type: ActionTypes.SET_IMAGE,
        index: i,
        payload: imageResult,
      });

      if (i === 0 && imageResult && imageResult.displayUrl) {
        dispatch({
          type: ActionTypes.ADD_TO_HISTORY,
          payload: { prompt: state.prompt, imageUrl: imageResult.displayUrl },
        });
      }
    }
    blobUrlsRef.current = newBlobUrls;

    dispatch({ type: ActionTypes.FINISH_LOADING });
    toast.dismiss(loadingToastId);

    if (successCount > 0) {
      toast.success(
        `Generated ${successCount} image${successCount > 1 ? "s" : ""}!`,
      );
    } else {
      toast.error("Failed to generate any images. Please try again.");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "All image generations failed.",
      });
    }
  }, [
    state.prompt,
    state.model,
    state.width,
    state.height,
    state.seed,
    state.noLogo,
    dispatch,
  ]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      blobUrlsRef.current = [];
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

export const useImageGeneration = () => {
  const context = useContext(ImageGenerationContext);
  if (context === undefined) {
    throw new Error(
      "useImageGeneration must be used within an ImageGenerationProvider",
    );
  }
  return context;
};
