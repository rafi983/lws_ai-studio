import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { generateImageFromApi } from "../api/pollinationsAPI";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../utils/toastUtils";

const ActionTypes = {
  SET_PROMPT: "SET_PROMPT",
  SET_MODEL: "SET_MODEL",
  SET_DIMENSIONS: "SET_DIMENSIONS",
  SET_SEED: "SET_SEED",
  SET_NOLOGO: "SET_NOLOGO",
  SET_IMAGES: "SET_IMAGES",
  SET_IMAGE: "SET_IMAGE",
  FINISH_LOADING: "FINISH_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_HISTORY: "SET_HISTORY",
  ADD_TO_HISTORY: "ADD_TO_HISTORY",
  LOAD_SAVED: "LOAD_SAVED",
};

const ImageGenerationContext = createContext();

const NUM_IMAGES_TO_GENERATE = 9;
const LOCAL_STORAGE_KEY = "lws-ai-generated-data";
const LOCAL_STORAGE_HISTORY_KEY = "lws-ai-prompt-history";

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
    case ActionTypes.SET_PROMPT:
      return { ...state, prompt: action.payload };
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
    case ActionTypes.SET_IMAGES:
      return { ...state, images: action.payload, loading: true, error: null };
    case ActionTypes.SET_IMAGE: {
      const { index, payload } = action;
      const updatedImages = [...state.images];
      updatedImages[index] = payload;
      return { ...state, images: updatedImages };
    }
    case ActionTypes.FINISH_LOADING:
      return { ...state, loading: false };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.SET_HISTORY:
      return { ...state, promptHistory: action.payload };
    case ActionTypes.ADD_TO_HISTORY: {
      const newEntry = action.payload;
      const updatedHistory = [
        newEntry,
        ...state.promptHistory.filter(
          (item) => item.prompt !== newEntry.prompt,
        ),
      ].slice(0, 20);
      return { ...state, promptHistory: updatedHistory };
    }
    case ActionTypes.LOAD_SAVED:
      return { ...state, ...action.payload, loading: false, error: null };
    default:
      return state;
  }
};

export const ImageGenerationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const blobUrlsRef = useRef([]);

  // ✅ LOAD FROM STORAGE
  useEffect(() => {
    try {
      const savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      const savedHistory = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY),
      );

      if (savedData && savedData.prompt && Array.isArray(savedData.images)) {
        dispatch({ type: ActionTypes.LOAD_SAVED, payload: savedData });
      }

      if (savedHistory && Array.isArray(savedHistory)) {
        dispatch({ type: ActionTypes.SET_HISTORY, payload: savedHistory });
      }
    } catch (err) {
      showErrorToast("Failed to load saved image data.");
    }
  }, []);

  // ✅ SAVE FULL IMAGES (NO FILTERING)
  useEffect(() => {
    if (state.images.length > 0) {
      const dataToSave = {
        prompt: state.prompt,
        model: state.model,
        width: state.width,
        height: state.height,
        seed: state.seed,
        noLogo: state.noLogo,
        images: state.images,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [state.prompt, state.images, state.model]);

  useEffect(() => {
    if (state.promptHistory.length > 0) {
      localStorage.setItem(
        LOCAL_STORAGE_HISTORY_KEY,
        JSON.stringify(state.promptHistory),
      );
    }
  }, [state.promptHistory]);

  const generateImages = useCallback(async () => {
    if (!state.prompt || !state.prompt.trim()) {
      showErrorToast("Please enter a prompt!");
      dispatch({ type: ActionTypes.FINISH_LOADING });
      return;
    }

    dispatch({
      type: ActionTypes.SET_IMAGES,
      payload: Array(NUM_IMAGES_TO_GENERATE).fill({ status: "queued" }),
    });

    const baseSeed = state.seed
      ? parseInt(state.seed, 10)
      : Math.floor(Math.random() * 1000000000);

    let firstImageUrl = null;

    for (let i = 0; i < NUM_IMAGES_TO_GENERATE; i++) {
      dispatch({
        type: ActionTypes.SET_IMAGE,
        index: i,
        payload: { status: "loading" },
      });

      let imageResult = null;
      try {
        const apiResponse = await generateImageFromApi({
          prompt: state.prompt,
          model: state.model,
          width: state.width,
          height: state.height,
          seed: state.seed ? baseSeed : baseSeed + i,
          noLogo: state.noLogo,
        });

        if (apiResponse && apiResponse.displayUrl) {
          imageResult = {
            id: `${Date.now()}-${i}`,
            prompt: state.prompt,
            model: state.model,
            seed: state.seed ? baseSeed : baseSeed + i,
            width: state.width,
            height: state.height,
            displayUrl: apiResponse.displayUrl,
            permanentUrl: apiResponse.permanentUrl || apiResponse.displayUrl,
            status: "ready",
          };

          if (!firstImageUrl) firstImageUrl = apiResponse.displayUrl;
        } else {
          imageResult = { status: "error" };
          showWarningToast("One of the images could not be generated.");
        }
      } catch {
        imageResult = { status: "error" };
        showWarningToast("Image generation failed for one item.");
      }

      dispatch({ type: ActionTypes.SET_IMAGE, index: i, payload: imageResult });
    }

    dispatch({ type: ActionTypes.FINISH_LOADING });

    if (firstImageUrl) {
      dispatch({
        type: ActionTypes.ADD_TO_HISTORY,
        payload: { prompt: state.prompt, imageUrl: firstImageUrl },
      });
      showSuccessToast("Prompt saved to history!");
    }
  }, [
    state.prompt,
    state.model,
    state.width,
    state.height,
    state.seed,
    state.noLogo,
  ]);

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
