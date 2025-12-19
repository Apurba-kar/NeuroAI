const AppError = require("../utils/appError");
const { getModel } = require("./gemini");
const mimeTypeMap = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

exports.generateContentFromImage = async (prompt, imageBuffer, imageFormat) => {
  const model = getModel("gemini-2.5-flash");

  const mimeType = mimeTypeMap[imageFormat.toLowerCase()];
  if (!mimeType) {
    throw new AppError(
      `Unsupported image format for Gemini API: ${imageFormat}`
    );
  }

  const imageBase64 = imageBuffer.toString("base64");
  const result = await model.generateContent([
    { text: typeof prompt === "object" ? JSON.stringify(prompt) : prompt },
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const aiResponse = result.response.text();
  if (!aiResponse) {
    throw new AppError("No response from Gemini API", 500);
  }
  return aiResponse;
};
