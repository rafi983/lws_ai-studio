import React, { useState } from "react";
import Layout from "./components/Layout";
import Header from "./components/Header";
import CreateImagePage from "./pages/CreateImagePage";
import DownloadedPage from "./pages/DownloadedPage";
import { ImageGenerationProvider } from "./context/ImageGenerationContext.jsx";
import { DownloadsProvider } from "./context/DownloadsContext.jsx";
import { FavouritesProvider } from "./context/FavouritesContext.jsx";
import FavouritesPage from "./pages/FavouritesPage.jsx";
import { CollectionsProvider } from "./context/CollectionsContext.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("create");

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <DownloadsProvider>
      <FavouritesProvider>
        <CollectionsProvider>
          <ImageGenerationProvider>
            <Layout>
              <Header currentPage={currentPage} navigate={navigate} />
              <main className="relative z-10">
                {currentPage === "create" && <CreateImagePage />}
                {currentPage === "collections" && <CollectionsPage />}
                {currentPage === "downloaded" && <DownloadedPage />}
                {currentPage === "favourites" && <FavouritesPage />}
              </main>
            </Layout>
          </ImageGenerationProvider>
        </CollectionsProvider>
      </FavouritesProvider>
    </DownloadsProvider>
  );
}

export default App;
