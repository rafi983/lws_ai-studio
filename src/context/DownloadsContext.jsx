import React, { createContext, useContext, useReducer, useEffect } from "react";

const DownloadsContext = createContext();

const ActionTypes = {
  ADD_DOWNLOAD: "ADD_DOWNLOAD",
};

const LOCAL_STORAGE_DOWNLOADS_KEY = "lws-ai-downloads";

const loadInitialState = () => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_DOWNLOADS_KEY);
    if (serializedState === null) {
      return { downloads: [] };
    }
    const storedState = JSON.parse(serializedState);
    if (storedState && Array.isArray(storedState.downloads)) {
      return {
        downloads: storedState.downloads
          .filter((img) => img && typeof img.permanentUrl === "string")
          .map((img) => ({
            ...img,
            id:
              img.id ||
              `${Date.now()}-dl-${Math.random().toString(36).slice(2, 11)}`,
            displayUrl: img.permanentUrl,
          })),
      };
    }
    console.warn("Stored downloads format is invalid. Clearing it.");
    localStorage.removeItem(LOCAL_STORAGE_DOWNLOADS_KEY);
  } catch (error) {
    console.error(
      "Could not load/parse downloads from local storage. Clearing it.",
      error,
    );
    localStorage.removeItem(LOCAL_STORAGE_DOWNLOADS_KEY);
  }
  return { downloads: [] };
};

const downloadsReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_DOWNLOAD: {
      const incomingImage = action.payload;

      if (!incomingImage || typeof incomingImage.permanentUrl !== "string") {
        console.warn(
          "ADD_DOWNLOAD: Invalid image payload received.",
          incomingImage,
        );
        return state;
      }

      let imageId = incomingImage.id;
      if (!imageId) {
        imageId = `${Date.now()}-dl-${Math.random().toString(36).slice(2, 11)}`;
      }

      if (state.downloads.find((item) => item.id === imageId)) {
        return state;
      }

      if (
        !incomingImage.id &&
        state.downloads.find(
          (item) => item.permanentUrl === incomingImage.permanentUrl,
        )
      ) {
        return state;
      }

      const imageToStore = {
        id: imageId,
        permanentUrl: incomingImage.permanentUrl,
        displayUrl: incomingImage.permanentUrl,
        prompt: incomingImage.prompt || "",
        model: incomingImage.model || "",
        seed: incomingImage.seed || "",
        width: incomingImage.width || 0,
        height: incomingImage.height || 0,
        ...(incomingImage.originalName && {
          originalName: incomingImage.originalName,
        }),
      };

      return { ...state, downloads: [imageToStore, ...state.downloads] };
    }

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
    if (Array.isArray(state.downloads)) {
      try {
        const downloadsToSave = state.downloads.map((img) => ({
          id: img.id,
          permanentUrl: img.permanentUrl,
          prompt: img.prompt,
          model: img.model,
          seed: img.seed,
          width: img.width,
          height: img.height,
          ...(img.originalName && { originalName: img.originalName }),
        }));
        const serializedState = JSON.stringify({ downloads: downloadsToSave });
        localStorage.setItem(LOCAL_STORAGE_DOWNLOADS_KEY, serializedState);
      } catch (error) {
        console.error(
          "Could not save downloads to local storage (stringify or setItem error):",
          error,
        );
      }
    } else if (typeof state.downloads !== "undefined") {
      console.warn(
        "Attempted to save non-array downloads state. This indicates an issue.",
        state.downloads,
      );
    }
  }, [state.downloads]);

  return (
    <DownloadsContext.Provider value={{ state, dispatch }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (context === undefined) {
    throw new Error("useDownloads must be used within a DownloadsProvider");
  }
  return context;
};
