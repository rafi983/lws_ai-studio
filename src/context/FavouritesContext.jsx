import React, { createContext, useReducer, useContext, useEffect } from "react";

const FavouritesContext = createContext();

const initialState = {
  favourites: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_FAVOURITE":
      const image = action.payload;
      const newFavourites = { ...state.favourites };

      if (newFavourites[image.permanentUrl]) {
        delete newFavourites[image.permanentUrl];
      } else {
        newFavourites[image.permanentUrl] = image;
      }

      localStorage.setItem("lws-ai-favourites", JSON.stringify(newFavourites));
      return { ...state, favourites: newFavourites };

    case "LOAD_FAVOURITES":
      return { ...state, favourites: action.payload || {} };

    default:
      return state;
  }
};

export const FavouritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lws-ai-favourites");
      if (saved) {
        dispatch({ type: "LOAD_FAVOURITES", payload: JSON.parse(saved) });
      }
    } catch (err) {
      console.error("Could not load favourites from local storage", err);
    }
  }, []);

  return (
    <FavouritesContext.Provider value={{ state, dispatch }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);
