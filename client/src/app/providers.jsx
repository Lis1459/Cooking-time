import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "../libs/queryClient";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <Toaster richColors position="top-center" />
          <ReactQueryDevtools initialIsOpen={false} />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
