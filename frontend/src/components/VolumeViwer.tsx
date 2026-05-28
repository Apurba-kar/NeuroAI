// components/ThreeDViewer.tsx
import React, { useEffect, useRef } from "react";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";

type Props = { volumeUrl: string };

export const ThreeDViewer: React.FC<Props> = ({ volumeUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderWindow = vtkGenericRenderWindow.newInstance();
    renderWindow.setContainer(containerRef.current);

    const renderer = renderWindow.getRenderer();
    const render = renderWindow.getRenderWindow();

    // Create a 3D ImageData volume
    const imageData = vtkImageData.newInstance();
    imageData.setDimensions(64, 64, 64);
    
    const scalars = new Uint8Array(64 * 64 * 64);
    const cx = 32, cy = 32, cz = 32;

    for (let z = 0; z < 64; z++) {
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const idx = x + y * 64 + z * 64 * 64;
          
          // Compute normalized ellipsoid distances to model head anatomy
          const rx = x - cx;
          const ry = (y - cy) * 1.15; // Elongate front-to-back
          const rz = (z - cz) * 0.95; // Squash top-to-bottom
          const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);

          let val = 0;

          if (dist < 22) {
            // Brain matter folds (gyri/sulci) simulated using multiple high frequency sine waves
            const foldFrequency = 0.45;
            const folds = 
              Math.sin(x * foldFrequency) * 
              Math.cos(y * foldFrequency) * 
              Math.sin(z * foldFrequency) * 20;

            const lobularShape = 
              Math.cos(x * 0.15) * 
              Math.sin(y * 0.1) * 8;

            val = 135 + folds + lobularShape;

            // Ventricles inside (dark areas)
            const vdist = Math.sqrt(rx * rx * 3 + (ry - 2) * (ry - 2) + rz * rz * 2);
            if (vdist < 7) {
              val = 20; 
            }
          } else if (dist >= 24 && dist <= 26.5) {
            // Outer bright bone skull structure
            const texture = Math.cos(x * 0.2) * Math.sin(z * 0.2) * 5;
            val = 210 + texture;
          }

          scalars[idx] = val;
        }
      }
    }

    const dataArray = vtkDataArray.newInstance({
      values: scalars,
      name: "Scalars",
    });

    imageData.getPointData().setScalars(dataArray);

    const mapper = vtkVolumeMapper.newInstance();
    mapper.setInputData(imageData);

    const volume = vtkVolume.newInstance();
    volume.setMapper(mapper);

    // Apply beautiful medical-AI cyan/teal color maps and soft opacity transfer functions
    const colorTransferFunction = vtkColorTransferFunction.newInstance();
    colorTransferFunction.addRGBPoint(0, 0.0, 0.0, 0.0);
    colorTransferFunction.addRGBPoint(20, 0.05, 0.05, 0.15); // CSF / background dark blue
    colorTransferFunction.addRGBPoint(100, 0.0, 0.5, 0.8);   // Soft cyan
    colorTransferFunction.addRGBPoint(150, 0.0, 0.9, 0.9);   // Teal brain matter
    colorTransferFunction.addRGBPoint(220, 0.85, 0.95, 1.0); // Bright white skull bone

    const opacityTransferFunction = vtkPiecewiseFunction.newInstance();
    opacityTransferFunction.addPoint(0, 0.0);
    opacityTransferFunction.addPoint(20, 0.02);
    opacityTransferFunction.addPoint(100, 0.15);
    opacityTransferFunction.addPoint(150, 0.35);
    opacityTransferFunction.addPoint(220, 0.70);

    volume.getProperty().setRGBTransferFunction(0, colorTransferFunction);
    volume.getProperty().setScalarOpacity(0, opacityTransferFunction);
    volume.getProperty().setScalarOpacityUnitDistance(0, 3.5);
    volume.getProperty().setInterpolationTypeToLinear();

    renderer.addVolume(volume);
    renderer.resetCamera();
    
    // Set a deep space dark background color matching the visual theme
    renderer.setBackground(0.04, 0.06, 0.12);
    
    render.render();

    return () => renderWindow.delete();
  }, [volumeUrl]);

  return <div ref={containerRef} className="w-full h-[600px] bg-[#0a0f24] rounded-lg overflow-hidden border border-cyan-500/10 shadow-lg" />;
};
