import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (
        error.message?.includes("Unauthorized") ||
        error.message?.includes("401")
      ) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      if (
        error.message?.includes("Unauthorized") ||
        error.message?.includes("401")
      ) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
