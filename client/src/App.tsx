import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ToastContainer } from "./components/common/Toast";
import { UploadPage } from "./pages/UploadPage";
import { SearchPage } from "./pages/SearchPage";
import { ListPage } from "./pages/ListPage";
import type { Page } from "./types";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState<Page>("upload");

  return (
    <div className="app-layout">
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1"></div>
        <div className="aurora-orb aurora-orb-2"></div>
      </div>
      
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content" key={activePage}>
        {activePage === "upload" && <UploadPage />}
        {activePage === "search" && <SearchPage />}
        {activePage === "list" && <ListPage />}
      </main>

      <ToastContainer />
    </div>
  );
}

export default App;
