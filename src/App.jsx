import React, { useState } from "react";
import Layout from "./components/Layout";
import Header from "./components/Header";
import CreateImagePage from "./pages/CreateImagePage";
import DownloadedPage from "./pages/DownloadedPage";
import { DownloadsProvider } from "./context/DownloadsContext.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("create");

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <DownloadsProvider>
      <Layout>
        <Header currentPage={currentPage} navigate={navigate} />
        <main className="relative z-10">
          {currentPage === "create" && <CreateImagePage />}
          {currentPage === "downloaded" && <DownloadedPage />}
        </main>
      </Layout>
    </DownloadsProvider>
  );
}

export default App;
