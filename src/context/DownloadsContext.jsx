import React, { createContext, useContext, useReducer, useEffect } from "react";

// 1. Create the Context
const DownloadsContext = createContext();

// 2. Define the Initial State and Reducer
const initialState = {
  downloads: [],
};

const downloadsReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_DOWNLOADS":
      return {
        ...state,
        downloads: action.payload,
      };
    case "ADD_DOWNLOAD":
      // Ensure no duplicates are added
      if (
        state.downloads.find(
          (item) => item.imageUrl === action.payload.imageUrl,
        )
      ) {
        return state;
      }
      const newDownloads = [action.payload, ...state.downloads];
      localStorage.setItem("downloads", JSON.stringify(newDownloads));
      return {
        ...state,
        downloads: newDownloads,
      };
    default:
      return state;
  }
};

// 3. Create the Provider Component
export const DownloadsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(downloadsReducer, initialState);

  // Load downloads from localStorage on initial render
  useEffect(() => {
    try {
      const localDownloads = localStorage.getItem("downloads");
      if (localDownloads) {
        dispatch({
          type: "LOAD_DOWNLOADS",
          payload: JSON.parse(localDownloads),
        });
      }
    } catch (error) {
      console.error("Failed to load downloads from localStorage", error);
    }
  }, []);

  return (
    <DownloadsContext.Provider value={{ state, dispatch }}>
      {children}
    </DownloadsContext.Provider>
  );
};

// 4. Create a custom hook for easy access
export const useDownloads = () => {
  return useContext(DownloadsContext);
};
