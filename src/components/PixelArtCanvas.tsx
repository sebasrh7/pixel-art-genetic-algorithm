import React from "react";
import { ImageMatrix, Individual } from "../utils/evolutionaryAlgorithm";

interface PixelArtCanvasProps {
  image?: Individual;
  target?: ImageMatrix;
}

const PixelArtCanvas: React.FC<PixelArtCanvasProps> = ({ image, target }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 16; // Tamaño de cada píxel

    canvas.width = 256; // Ancho de la imagen
    canvas.height = 256; // Alto de la imagen

    if (image) {
      console.log(image);
      for (let y = 0; y < image.image.length; y++) {
        for (let x = 0; x < image.image[y].length; x++) {
          const [r, g, b] = image.image[y][x];
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    if (target) {
      for (let y = 0; y < target.length; y++) {
        for (let x = 0; x < target[y].length; x++) {
          const [r, g, b] = target[y][x];
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [image, target]);

  return <canvas ref={canvasRef} />;
};

export default PixelArtCanvas;
