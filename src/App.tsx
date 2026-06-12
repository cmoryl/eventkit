import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Agent from "./pages/Agent";
import PowerPointAgent from "./pages/PowerPointAgent";
import SlidesPage from "./pages/Slides";
import BrandDebug from "./pages/BrandDebug";
import BrandLibrary from "./pages/BrandLibrary";
import BrandHealth from "./pages/BrandHealth";
import BrandGuideAssets from "./pages/BrandGuideAssets";
import BrandBrain from "./pages/BrandBrain";
import LogoPlacementMatrix from "./pages/LogoPlacementMatrix";
import LogoConsistencyAudit from "./pages/LogoConsistencyAudit";
import NotFound from "./pages/NotFound";
import { CreationStudio } from "@/components/studio/CreationStudio";
import { initializeBrandTheme } from "@/services/brandThemeService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Initialize brand theme from session on app load
  useEffect(() => {
    initializeBrandTheme();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/agent" element={<Agent />} />
                <Route path="/agent/powerpoint" element={<PowerPointAgent />} />
                <Route path="/slides" element={<SlidesPage />} />
                <Route path="/brand-library" element={<BrandLibrary />} />
                <Route path="/brand-brain" element={<BrandBrain />} />
                <Route path="/brand-assets" element={<BrandGuideAssets />} />
                <Route path="/brand-health" element={<BrandHealth />} />
                <Route path="/logo-placement" element={<LogoPlacementMatrix />} />
                <Route path="/logo-audit" element={<LogoConsistencyAudit />} />
                <Route path="/brand-debug" element={<BrandDebug />} />
                <Route path="/studio/:studioId" element={<CreationStudio />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
