// src/context/FavouritesContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from "react";

const FavouritesContext = createContext();

const loadInitialState = () => {
  try {
    const stored = localStorage.getItem("lws-ai-favourites");
    return stored ? JSON.parse(stored) : { favourites: [] };
  } catch {
    return { favourites: [] };
  }
};

const favouritesReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_FAVOURITE":
      const exists = state.favourites.find(
        (f) => f.permanentUrl === action.payload.permanentUrl,
      );
      return {
        favourites: exists
          ? state.favourites.filter(
              (f) => f.permanentUrl !== action.payload.permanentUrl,
            )
          : [action.payload, ...state.favourites],
      };
    default:
      return state;
  }
};

export const FavouritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    loadInitialState,
  );

  useEffect(() => {
    localStorage.setItem("lws-ai-favourites", JSON.stringify(state));
  }, [state]);

  return (
    <FavouritesContext.Provider value={{ state, dispatch }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);
