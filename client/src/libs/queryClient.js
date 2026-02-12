import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        console.log("Mutation error");
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 409) {
          toast.info("Вы уже отмечали этот рецепт");
          return;
        }

        if (message) {
          toast.error(message);
          return;
        }

        toast.error("Что-то пошло не так");
      },

      //   onSuccess: (data, variables, context, mutation) => {
      //     // Можно делать глобальные success уведомления
      //     // Но обычно лучше точечно
      //   },
    },
  },
});
