const dicomParser = require("dicom-parser");
const { NativePixelDecoder, DicomImage } = require("dcmjs-imaging");
const sharp = require("sharp");
const AppError = require("./appError");

exports.parseDicomFile = async (dicomBuffer) => {
  // dicom-parser expects a Uint8Array. Node.js Buffer can be used directly as it is a subclass of Uint8Array.

  const dataSet = dicomParser.parseDicom(dicomBuffer);
  if (!dataSet) {
    throw new AppError("Failed to parse DICOM file.", 400);
  }

  // --- Extracting Metadata ---
  const patientName = dataSet.string("x00100010");
  const studyDescription = dataSet.string("x00081030");
  const rows = dataSet.uint16("x00280010");
  const columns = dataSet.uint16("x00280011");
  const bitsAllocated = dataSet.uint16("x00280100");
  const windowCenter = dataSet.floatString("x00281050");
  const windowWidth = dataSet.floatString("x00281051");

  // console.log(`Patient Name: ${patientName}`);
  // console.log(`Dimensions: ${columns}x${rows}`);
  // console.log(`Bits Allocated: ${bitsAllocated}`);

  // --- Extracting Raw Pixel Data Element ---
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) {
    throw new AppError("PixelData element (7FE0,0010) not found.", 404);
  }

  // The pixelData is a view into the original dicomBuffer
  const pixelData = new Uint8Array(
    dataSet.byteArray.buffer,
    pixelDataElement.dataOffset,
    pixelDataElement.length
  );

  return {
    metadata: {
      patientName,
      studyDescription,
      rows,
      columns,
      bitsAllocated,
      windowCenter,
      windowWidth,
    },
    rawPixelData: pixelData,
    dataSet,
  };
};

exports.renderDicomToRgba = async (dicomBuffer) => {
  // Initialize native decoders to support compressed DICOM files (e.g., JPEG, JPEG-LS). This is an async operation that only needs to be done once.
  await NativePixelDecoder.initializeAsync();

  // The DicomImage class takes the entire DICOM file buffer
  const image = new DicomImage(dicomBuffer.buffer);

  // The render() method performs the complex work of decoding and applying windowing/leveling to produce a viewable image.

  const renderingResult = image.render();

  if (!renderingResult || !renderingResult.pixels) {
    throw new AppError("Failed to render DICOM image.", 400);
  }

  // The output is an RGBA pixel buffer
  const rgbaBuffer = Buffer.from(renderingResult.pixels);
  const { width, height } = renderingResult;

  console.log(`Rendered RGBA buffer of size ${width}x${height}.`);

  return { rgbaBuffer, width, height };
};

exports.encodeRgbaToPng = async (dicomBuffer, width, height) => {
  // Sharp can take a raw pixel buffer as input, provided you specify its dimensions and channel information.
  const pngBuffer = await sharp(dicomBuffer, {
    raw: {
      width: width,
      height: height,
      channels: 4, // 4 channels for RGBA
    },
  })
    .png()
    .toBuffer();

  console.log(
    `Encoded RGBA data to a PNG buffer of ${pngBuffer.length} bytes.`
  );
  return pngBuffer;
};
