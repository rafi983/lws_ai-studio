import React, { createContext, useContext, useReducer } from "react";

const DownloadsContext = createContext();

const initialState = {
  downloads: [],
};

const downloadsReducer = (state, action) => {
  switch (action.type) {
    case "ADD_DOWNLOAD":
      if (
        state.downloads.find(
          (item) => item.imageUrl === action.payload.imageUrl,
        )
      ) {
        return state;
      }
      return { ...state, downloads: [action.payload, ...state.downloads] };
    default:
      return state;
  }
};

export const DownloadsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(downloadsReducer, initialState);

  return (
    <DownloadsContext.Provider value={{ state, dispatch }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  return useContext(DownloadsContext);
};
