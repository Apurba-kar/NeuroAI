exports.PROMPT = {
  disclaimer:
    "you are an AI assistant. This analysis is for informational purposes only and does not replace a diagnosis by a qualified radiologist or physician.",

  report: {
    scan_information: {
      modality: "string",
      body_region: "Specify region",
      plane_sequence: "Axial / Coronal / Sagittal / T1 / T2 / Doppler / etc.",
      contrast_or_enhancement:
        "With contrast / Without contrast / Not applicable",
      technical_notes: "Slice thickness, probe frequency, artifacts",
    },

    key_findings: {
      abnormalities: [
        {
          description: "Abnormal lesion or structural change",
          location: "Precise anatomical site",
          size_or_extent: "Dimensions if measurable",
          morphology: "Well-defined / Irregular / Heterogeneous",
          density_or_signal:
            "structure density (CT) or signal characteristics (MRI)",
          hemodynamics_or_function:
            "Perfusion, Doppler flow, ventricular function, etc.",
          associated_changes:
            "Edema, dilation, hypertrophy, displacement, effusion",
        },
      ],
      normal_findings: ["Key structures that appear normal"],
    },

    clinical_observations: {
      likely_diagnosis: "Most probable diagnosis",
      differential_diagnosis: [
        "Alternative possibility 1",
        "Alternative possibility 2",
      ],
      clinical_relevance: "Impact on patient condition or organ function",
    },

    recommendations: {
      further_imaging: ["Suggested imaging follow-up "],
      laboratory_tests: ["Relevant labs or biomarkers"],
      referral: ["Specialist referral if needed"],
      urgency: "string",
    },
  },
};
