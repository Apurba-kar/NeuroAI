const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const handlebars = require("handlebars");
const Analysis = require("../models/analysisModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const axios = require("axios");

exports.generateReport = catchAsync(async (req, res, next) => {
  const { analysisId } = req.params;

  // 1. Fetch from MongoDB
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) {
    return next(new AppError("No analysis found with that ID", 404));
  }
  // 2. Fetch image from Cloudinary as base64
  let base64Image = "";
  try {
    const response = await axios.get(analysis.cloudinaryImageUrl, {
      responseType: "arraybuffer",
    });

    const mimeType = response.headers["content-type"]?.startsWith("image/")
      ? response.headers["content-type"]
      : "image/png";

    base64Image = `data:${mimeType};base64,${Buffer.from(
      response.data
    ).toString("base64")}`;

    base64Image = `data:${mimeType};base64,${Buffer.from(
      response.data
    ).toString("base64")}`;
  } catch (err) {
    return next(new AppError("Failed to fetch image from Cloudinary", 500));
  }
  // console.log(
  //   "Fetched image from Cloudinary",
  //   base64Image.slice(0, 30) + "..."
  // );
  // 2. Transform MongoDB data for template
  const caseData = {
    patientName: analysis.data?.patientName || "Anonymous",
    caseId: analysis._id.toString(),
    mimeType: analysis.mimeType,
    image: base64Image,
    generatedAt: new Date(analysis.uploadedAt).toLocaleString(),

    // Executive Summary
    executiveSummary:
      analysis.analysisResults?.clinical_observations?.likely_diagnosis ||
      "No summary available",

    // Report Sections
    scanInformation: analysis.analysisResults?.scan_information || {},

    findings: {
      abnormalities:
        analysis.analysisResults?.key_findings?.abnormalities?.map((f) => ({
          description: f.description,
          location: f.location,
          size_or_extent: f.size_or_extent,
          morphology: f.morphology,
          density_or_signal: f.density_or_signal,
          hemodynamics_or_function: f.hemodynamics_or_function,
          associated_changes: f.associated_changes,
        })) || [],
      normal: analysis.analysisResults?.key_findings?.normal_findings || [],
    },

    clinicalObservations: {
      likelyDiagnosis:
        analysis.analysisResults?.clinical_observations?.likely_diagnosis || "",
      differentialDiagnosis:
        analysis.analysisResults?.clinical_observations
          ?.differential_diagnosis || [],
      clinicalRelevance:
        analysis.analysisResults?.clinical_observations?.clinical_relevance ||
        "",
    },

    recommendations: {
      furtherImaging:
        analysis.analysisResults?.recommendations?.further_imaging || [],
      laboratoryTests:
        analysis.analysisResults?.recommendations?.laboratory_tests || [],
      referral: analysis.analysisResults?.recommendations?.referral || [],
      urgency: analysis.analysisResults?.recommendations?.urgency || "",
    },
  };

  // 3. Load and compile template
  const templatePath = path.join(__dirname, "../templates/pdf.html");
  const templateHtml = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateHtml);
  const finalHtml = template(caseData);

  // 4. Puppeteer PDF generation
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: "domcontentloaded" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
  });
  if (!pdfBuffer) {
    return next(new AppError("Failed to generate PDF", 500));
  }

  await browser.close();

  // 5. Stream PDF to client
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=analysis-${analysisId}.pdf`
  );
  res.end(pdfBuffer);
});
