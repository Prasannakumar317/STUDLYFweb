import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./lib/auth";
import { ProjectsProvider } from "./lib/projects";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceShell from "./components/workspace/WorkspaceShell";

import LandingPage from "./pages/LandingPage";
import AuthCallback from "./pages/AuthCallback";
import WorkspaceHomePage from "./pages/WorkspaceHomePage";
import DashboardHomePage from "./pages/DashboardHomePage";
import ProjectsPage from "./pages/ProjectsPage";
import StrategyPage from "./pages/StrategyPage";
import MarketingPage from "./pages/MarketingPage";
import FundingPage from "./pages/FundingPage";
import DocumentsPage from "./pages/DocumentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import { CompanyDetailPage, DiscoverListPage } from "./pages/DiscoverPages";

import "./App.css";

function AppRouter() {
  const location = useLocation();
  // Synchronous check for session_id BEFORE normal routing — prevents race conditions
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><WorkspaceHomePage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/dashboard"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><DashboardHomePage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/projects"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><ProjectsPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/strategy"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><StrategyPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/marketing"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><MarketingPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/funding"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><FundingPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/documents"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><DocumentsPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/analytics"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><AnalyticsPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace/settings"
        element={
          <ProtectedRoute>
            <ProjectsProvider>
              <WorkspaceShell><SettingsPage /></WorkspaceShell>
            </ProjectsProvider>
          </ProtectedRoute>
        }
      />
      <Route path="/discover" element={<DiscoverListPage route="/discover" />} />
      <Route path="/discover/blog" element={<DiscoverListPage route="/discover/blog" />} />
      <Route path="/discover/lists" element={<DiscoverListPage route="/discover/lists" />} />
      <Route path="/discover/hiring" element={<DiscoverListPage route="/discover/hiring" />} />
      <Route path="/discover/remote" element={<DiscoverListPage route="/discover/remote" />} />
      <Route path="/discover/company/:slug" element={<CompanyDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="bottom-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
