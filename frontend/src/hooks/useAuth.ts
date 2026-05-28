import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type User } from "../utils/api";

export function useUser() {
  return useQuery<User | null, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const user = await authApi.getMe();
        return user;
      } catch (err) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: any }) => authApi.resetPassword(token, data),
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updatePassword,
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });
}
