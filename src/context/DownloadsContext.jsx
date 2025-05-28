import React, { createContext, useContext, useReducer, useEffect } from "react";

const DownloadsContext = createContext();

const loadInitialState = () => {
  try {
    const serializedState = localStorage.getItem("lws-ai-downloads");
    if (serializedState === null) {
      return { downloads: [] };
    }
    const storedState = JSON.parse(serializedState);
    if (Array.isArray(storedState.downloads)) {
      // Ensure items loaded from storage also have displayUrl set correctly from permanentUrl
      return {
        downloads: storedState.downloads.map((img) => ({
          ...img,
          displayUrl: img.permanentUrl,
        })),
      };
    }
  } catch (error) {
    console.error("Could not load downloads from local storage", error);
  }
  return { downloads: [] };
};

const downloadsReducer = (state, action) => {
  switch (action.type) {
    case "ADD_DOWNLOAD":
      const incomingImage = action.payload; // Should now contain the original 'id'

      const imageToStore = {
        ...incomingImage,
        // Ensure displayUrl for downloaded items consistently uses permanentUrl
        displayUrl: incomingImage.permanentUrl,
      };

      // If 'id' is somehow still missing from incomingImage (should not happen with new page code),
      // then create one. This makes the ID generation fallback more explicit.
      if (!imageToStore.id && imageToStore.permanentUrl) {
        imageToStore.id = `${Date.now()}-dl-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Prevent duplicates based on the definitive ID
      if (
        imageToStore.id &&
        state.downloads.find((item) => item.id === imageToStore.id)
      ) {
        return state;
      }
      // Fallback duplicate check for very old data that might not have an ID,
      // though this path is less likely with the ID propagation fix.
      if (
        !imageToStore.id &&
        imageToStore.permanentUrl &&
        state.downloads.find(
          (item) => item.permanentUrl === imageToStore.permanentUrl,
        )
      ) {
        return state;
      }

      return { ...state, downloads: [imageToStore, ...state.downloads] };

    default:
      return state;
  }
};

export const DownloadsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    downloadsReducer,
    undefined,
    loadInitialState,
  );

  useEffect(() => {
    try {
      // Store only essential, serializable data.
      // displayUrl is reconstructed on load from permanentUrl.
      const downloadsToSave = state.downloads.map((img) => ({
        id: img.id,
        permanentUrl: img.permanentUrl,
        prompt: img.prompt,
        model: img.model,
        seed: img.seed,
        width: img.width,
        height: img.height,
      }));
      const serializedState = JSON.stringify({ downloads: downloadsToSave });
      localStorage.setItem("lws-ai-downloads", serializedState);
    } catch (error) {
      console.error("Could not save downloads to local storage", error);
    }
  }, [state]);

  return (
    <DownloadsContext.Provider value={{ state, dispatch }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  return useContext(DownloadsContext);
};
