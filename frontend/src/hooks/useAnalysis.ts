import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analysisApi, type Analysis } from "../utils/api";

export function useAnalyses(archived = false) {
  return useQuery<Analysis[], Error>({
    queryKey: ["analyses", archived],
    queryFn: () => analysisApi.getAll(archived),
    staleTime: 30000, // 30 seconds
  });
}

export function useAnalysis(id: string) {
  return useQuery<Analysis, Error>({
    queryKey: ["analysis", id],
    queryFn: () => analysisApi.getOne(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

export function useUploadAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => {
      return analysisApi.upload(file, (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}

export function useArchiveAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}

export function useUnarchiveAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.unarchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
  });
}
