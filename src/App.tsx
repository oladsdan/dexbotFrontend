import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PasswordProtectedRoute from "./pages/PasswordProtectedRoute";
import TransactionPage from "./pages/TransactionPage";
import Layout from "./components/Layout";
import SignalsPage from "./pages/Signals";
import ContractStatusPage from "./pages/ContractStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route
              path="/password-protected"
              element={<PasswordProtectedRoute />}
            />
            <Route
              path="/signals"
              element={<SignalsPage />}
            />
            <Route
              path="/contract-status"
              element={<ContractStatusPage />}
            />
            <Route
              path="/transaction-details"
              element={<TransactionPage />}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
