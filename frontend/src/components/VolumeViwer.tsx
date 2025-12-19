// components/ThreeDViewer.tsx
import React, { useEffect, useRef } from "react";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";

type Props = { volumeUrl: string };

export const ThreeDViewer: React.FC<Props> = ({ volumeUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderWindow = vtkGenericRenderWindow.newInstance();
    renderWindow.setContainer(containerRef.current);

    const renderer = renderWindow.getRenderer();
    const render = renderWindow.getRenderWindow();

    // Example: Create a dummy vtkImageData volume
    const imageData = vtkImageData.newInstance();

    imageData.setDimensions(64, 64, 64);
    const scalars = new Uint8Array(64 * 64 * 64);
    for (let i = 0; i < scalars.length; i++) scalars[i] = i % 256;

    const dataArray = vtkDataArray.newInstance({
      values: scalars,
      name: "Scalars",
    });

    imageData.getPointData().setScalars(dataArray);

    const mapper = vtkVolumeMapper.newInstance();
    mapper.setInputData(imageData);

    const volume = vtkVolume.newInstance();
    volume.setMapper(mapper);

    renderer.addVolume(volume);
    renderer.resetCamera();
    render.render();

    return () => renderWindow.delete();
  }, [volumeUrl]);

  return <div ref={containerRef} className="w-full h-[600px] bg-black" />;
};
