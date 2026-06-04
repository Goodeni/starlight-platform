import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.invalidate();
      utils.auth.me.setData(undefined, null);
      window.location.href = "/";
    },
    onError: () => {
      utils.invalidate();
      window.location.href = "/";
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isTrainer: user?.role === "trainer",
      isLoading,
      error,
      logout,
    }),
    [user, isLoading, error, logout]
  );
}
