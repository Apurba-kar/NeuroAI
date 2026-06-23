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

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

exports.generateContentFromImage = async (
  prompt,
  imageBuffer,
  imageFormat
) => {
  const mimeType =
    mimeTypeMap[imageFormat.toLowerCase()];

  if (!mimeType) {
    throw new AppError(
      `Unsupported image format: ${imageFormat}`,
      400
    );
  }

  const imageBase64 =
    imageBuffer.toString("base64");

  const contents = [
    {
      text:
        typeof prompt === "object"
          ? JSON.stringify(prompt)
          : prompt,
    },
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ];

  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  let lastError;

  for (const modelName of models) {
    const model = getModel(modelName);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Using ${modelName}, attempt ${attempt}`
        );

        const result =
          await model.generateContent(
            contents
          );

        const response =
          result.response.text();

        if (!response) {
          throw new Error(
            "Empty Gemini response"
          );
        }

        return response;
      } catch (err) {
        lastError = err;

        console.error(
          `${modelName} failed`,
          err.status,
          err.message
        );

        if (
          err.status !== 503 &&
          err.status !== 429
        ) {
          throw err;
        }

        await sleep(attempt * 2000);
      }
    }
  }

  throw new AppError(
    "AI service is temporarily unavailable. Please try again later.",
    503
  );
};
