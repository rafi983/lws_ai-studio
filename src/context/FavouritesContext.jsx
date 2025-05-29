import React, { createContext, useReducer, useContext, useEffect } from "react";

const ActionTypes = {
  TOGGLE_FAVOURITE: "TOGGLE_FAVOURITE",
  SET_FAVOURITES: "SET_FAVOURITES",
};

const FavouritesContext = createContext();

const LOCAL_STORAGE_FAVOURITES_KEY = "lws-ai-favourites";

const initialState = {
  favourites: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_FAVOURITE: {
      const image = action.payload;
      if (!image || typeof image.id === "undefined") {
        console.warn(
          "TOGGLE_FAVOURITE action received invalid image payload:",
          image,
        );
        return state;
      }

      const newFavourites = { ...state.favourites };

      if (newFavourites[image.id]) {
        delete newFavourites[image.id];
      } else {
        newFavourites[image.id] = image;
      }
      return { ...state, favourites: newFavourites };
    }
    case ActionTypes.SET_FAVOURITES:
      return {
        ...state,
        favourites:
          action.payload &&
          typeof action.payload === "object" &&
          !Array.isArray(action.payload)
            ? action.payload
            : {},
      };
    default:
      return state;
  }
};

export const FavouritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const savedFavourites = localStorage.getItem(
        LOCAL_STORAGE_FAVOURITES_KEY,
      );
      if (savedFavourites) {
        const parsedFavourites = JSON.parse(savedFavourites);
        if (
          parsedFavourites &&
          typeof parsedFavourites === "object" &&
          !Array.isArray(parsedFavourites)
        ) {
          dispatch({
            type: ActionTypes.SET_FAVOURITES,
            payload: parsedFavourites,
          });
        } else {
          console.warn(
            "Loaded favourites from localStorage is not a valid object. Clearing it.",
            parsedFavourites,
          );
          localStorage.removeItem(LOCAL_STORAGE_FAVOURITES_KEY);
          dispatch({ type: ActionTypes.SET_FAVOURITES, payload: {} });
        }
      } else {
        dispatch({ type: ActionTypes.SET_FAVOURITES, payload: {} });
      }
    } catch (err) {
      console.error(
        "Could not load/parse favourites from local storage. Clearing it.",
        err,
      );
      localStorage.removeItem(LOCAL_STORAGE_FAVOURITES_KEY);
      dispatch({ type: ActionTypes.SET_FAVOURITES, payload: {} });
    }
  }, []);

  useEffect(() => {
    if (
      state.favourites &&
      typeof state.favourites === "object" &&
      !Array.isArray(state.favourites)
    ) {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_FAVOURITES_KEY,
          JSON.stringify(state.favourites),
        );
      } catch (error) {
        console.error(
          "Failed to save favourites to localStorage (stringify or setItem error):",
          error,
        );
      }
    } else if (typeof state.favourites !== "undefined") {
      console.warn(
        "Attempted to save invalid favourites state. This indicates an issue.",
        state.favourites,
      );
    }
  }, [state.favourites]);

  return (
    <FavouritesContext.Provider value={{ state, dispatch }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error("useFavourites must be used within a FavouritesProvider");
  }
  return context;
};
