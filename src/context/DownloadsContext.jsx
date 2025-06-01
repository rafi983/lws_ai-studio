import React, { createContext, useContext, useReducer, useEffect } from "react";
import toast from "react-hot-toast";

const DownloadsContext = createContext();

const ActionTypes = {
  ADD_DOWNLOAD: "ADD_DOWNLOAD",
};

const LOCAL_STORAGE_DOWNLOADS_KEY = "lws-ai-downloads";

const showWarningToast = (message) => {
  toast(message, {
    icon: "⚠️",
    style: {
      background: "#facc15", // Amber background
      color: "#000", // Black text
    },
  });
};

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
          .filter(
            (img) =>
              img &&
              typeof img.permanentUrl === "string" &&
              typeof img.id === "string",
          )
          .map((img) => ({
            ...img,
            displayUrl: img.permanentUrl,
          })),
      };
    }
    showWarningToast("Stored downloads data was invalid and has been cleared.");
    localStorage.removeItem(LOCAL_STORAGE_DOWNLOADS_KEY);
  } catch (error) {
    toast.error(
      `Could not load downloads: ${error.message}. Downloads have been cleared.`,
    );
    localStorage.removeItem(LOCAL_STORAGE_DOWNLOADS_KEY);
  }
  return { downloads: [] };
};

const downloadsReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_DOWNLOAD: {
      const incomingImage = action.payload;

      if (
        !incomingImage ||
        typeof incomingImage.permanentUrl !== "string" ||
        !incomingImage.id
      ) {
        showWarningToast(
          "Could not add to downloads: Invalid image data received.",
        );
        return state;
      }

      const imageId = String(incomingImage.id);

      if (state.downloads.find((item) => String(item.id) === imageId)) {
        toast.success("Image is already in your downloads list!");
        return state;
      }

      if (
        state.downloads.find(
          (item) => item.permanentUrl === incomingImage.permanentUrl,
        )
      ) {
        toast.success("Image (by URL) is already in your downloads list!");
        return state;
      }

      const imageToStore = {
        id: imageId,
        permanentUrl: incomingImage.permanentUrl,
        displayUrl: incomingImage.permanentUrl,
        prompt: incomingImage.prompt || "No prompt",
        model: incomingImage.model || "Unknown model",
        seed: incomingImage.seed || "N/A",
        width: incomingImage.width || 0,
        height: incomingImage.height || 0,
        originalName:
          incomingImage.originalName || `downloaded-image-${imageId}`,
        downloadedAt: new Date().toISOString(),
        ...incomingImage,
      };

      toast.success("Image added to downloads!");
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
          originalName: img.originalName,
          downloadedAt: img.downloadedAt,
        }));
        const serializedState = JSON.stringify({ downloads: downloadsToSave });
        localStorage.setItem(LOCAL_STORAGE_DOWNLOADS_KEY, serializedState);
      } catch (error) {
        toast.error(
          `Could not save downloads to your browser: ${error.message}`,
        );
      }
    } else if (typeof state.downloads !== "undefined") {
      showWarningToast(
        "An attempt to save an invalid downloads collection was prevented. Please report this if it persists.",
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
