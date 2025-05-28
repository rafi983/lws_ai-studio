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
      return storedState;
    }
  } catch (error) {
    console.error("Could not load downloads from local storage", error);
  }
  return { downloads: [] };
};

const downloadsReducer = (state, action) => {
  switch (action.type) {
    case "ADD_DOWNLOAD":
      const image = { ...action.payload };

      if (!image.id) {
        image.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      if (state.downloads.find((item) => item.id === image.id)) {
        return state;
      }

      return { ...state, downloads: [image, ...state.downloads] };

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
      const serializedState = JSON.stringify(state);
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
