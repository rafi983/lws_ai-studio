import React, { useState } from "react";
import Layout from "./components/Layout";
import Header from "./components/Header";
import CreateImagePage from "./pages/CreateImagePage";
import DownloadedPage from "./pages/DownloadedPage";
import { ImageGenerationProvider } from "./context/ImageGenerationContext.jsx";
import { DownloadsProvider } from "./context/DownloadsContext.jsx";
import { FavouritesProvider } from "./context/FavouritesContext.jsx";
import FavouritesPage from "./pages/FavouritesPage.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("create");

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <DownloadsProvider>
      <FavouritesProvider>
        <ImageGenerationProvider>
          <Layout>
            <Header currentPage={currentPage} navigate={navigate} />
            <main className="relative z-10">
              {currentPage === "create" && <CreateImagePage />}
              {currentPage === "downloaded" && <DownloadedPage />}
              {currentPage === "favourites" && <FavouritesPage />}
            </main>
          </Layout>
        </ImageGenerationProvider>
      </FavouritesProvider>
    </DownloadsProvider>
  );
}

export default App;
