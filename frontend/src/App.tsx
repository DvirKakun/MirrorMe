import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { ChatPage } from "./components/pages/ChatPage";
import { BlogPage } from "./components/pages/BlogPage";
import { SafePage } from "./components/pages/SafePage";
import { InfoPage } from "./components/pages/InfoPage";
import { StoriesPage } from "./components/pages/StoriesPage";
import TestLoginButton from "./components/debug/TestLoginButton";

import "./App.css";
import MainFooter from "./components/footer/MainFooter";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <TestLoginButton />

          <MainLayout>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/safe" element={<SafePage />} />
            </Routes>
          </MainLayout>
          <MainFooter />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
