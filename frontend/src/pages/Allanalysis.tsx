import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAnalysis } from "../utils/api";
import { useNavigate } from "react-router-dom";

type Analysis = {
  _id: string;
  data: {
    patientName: string;
    studyDescription: string;
  };
  user: {
    id: string;
    fullName: string;
  };
};

const AllAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: analyses = [],
    isLoading,
    error,
  } = useQuery<Analysis[]>({
    queryKey: ["allanalysis"],
    queryFn: getAllAnalysis,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>All Analyses ({analyses.length})</h1>
      <ul>
        {analyses.map((analysis) => (
          <div
            onClick={() => navigate(`/analysis/${analysis._id}`)}
            key={analysis._id}
            style={{
              marginBottom: "20px",
              border: "1px solid #ccc",
              padding: "10px",
              width: "400px",
            }}
          >
            <li>
              <b>Patient Name:</b> {analysis.data?.patientName ?? "Unknown"}
            </li>
            <li>
              <b>Study Description:</b> {analysis.data.studyDescription}
            </li>
            <li>
              <b>User:</b> {analysis.user.fullName}
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default AllAnalysis;
