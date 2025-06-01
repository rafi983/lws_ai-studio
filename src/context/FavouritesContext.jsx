import React, { createContext, useReducer, useContext, useEffect } from "react";
import toast from "react-hot-toast";

const ActionTypes = {
  TOGGLE_FAVOURITE: "TOGGLE_FAVOURITE",
  SET_FAVOURITES: "SET_FAVOURITES",
};

const FavouritesContext = createContext();

const LOCAL_STORAGE_FAVOURITES_KEY = "lws-ai-favourites";

const initialState = {
  favourites: {},
};

const showWarningToast = (message) => {
  toast(message, {
    icon: "⚠️",
    style: {
      background: "#facc15", // Amber background
      color: "#000", // Black text
    },
  });
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_FAVOURITE: {
      const image = action.payload;
      if (!image || typeof image.id === "undefined") {
        showWarningToast(
          "Could not toggle favourite: invalid image data received.",
        );
        return state;
      }

      const newFavourites = { ...state.favourites };
      const imageId = String(image.id);

      if (newFavourites[imageId]) {
        delete newFavourites[imageId];
        toast.success(
          `${image.prompt ? "'" + image.prompt.substring(0, 20) + "...'" : "Image"} removed from favourites!`,
        );
      } else {
        newFavourites[imageId] = image;
        toast.success(
          `${image.prompt ? "'" + image.prompt.substring(0, 20) + "...'" : "Image"} added to favourites!`,
        );
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
          showWarningToast(
            "Saved favourites data was malformed and has been cleared.",
          );
          localStorage.removeItem(LOCAL_STORAGE_FAVOURITES_KEY);
          dispatch({ type: ActionTypes.SET_FAVOURITES, payload: {} });
        }
      } else {
        dispatch({ type: ActionTypes.SET_FAVOURITES, payload: {} });
      }
    } catch (err) {
      toast.error(
        `Error loading favourites: ${err.message}. Favourites have been cleared.`,
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
        toast.error(
          `Failed to save favourites to your browser: ${error.message}`,
        );
      }
    } else if (typeof state.favourites !== "undefined") {
      showWarningToast(
        "An attempt to save an invalid favourites collection was prevented. If you see this often, please report it.",
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
