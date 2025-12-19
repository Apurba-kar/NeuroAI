import { init as coreInit } from '@cornerstonejs/core';
import { init as toolsInit } from '@cornerstonejs/tools';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';

export async function initCornerstone() {
  await coreInit();
  await toolsInit();
  await dicomImageLoaderInit();
}

