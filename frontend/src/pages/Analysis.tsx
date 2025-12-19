import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnalysisById } from "../utils/api";
import { ThreeDViewer } from "../components/VolumeViwer";

const Analysis = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: analysis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => getAnalysisById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading Visulization...</div>;
  if (error) return <div>Error loading visualization.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">3D Visualization</h2>
      <ThreeDViewer volumeUrl={analysis.processedImageUrl} />
    </div>
  );
};

export default Analysis;
