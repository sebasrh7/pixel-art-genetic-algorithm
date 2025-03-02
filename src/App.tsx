import { useEffect, useRef, useState } from "react";
import PixelArtCanvas from "./components/PixelArtCanvas";
import {
  evolve,
  generateInitialPopulation,
  ImageMatrix,
  Individual,
  loadTargetImage,
} from "./utils/evolutionaryAlgorithm";

import "./App.css";

function App() {
  const [population, setPopulation] = useState<Individual[]>([]);
  const [target, setTarget] = useState<ImageMatrix>([]);
  const [generation, setGeneration] = useState<number>(0);
  const [generationsToRun, setGenerationsToRun] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && generationsToRun > 0) {
      interval = setInterval(() => {
        setPopulation((prevPopulation) => {
          const newPopulation = evolve(prevPopulation);
          setGeneration((prevGen) => prevGen + 1);
          return newPopulation;
        });
        setGenerationsToRun((prev) => prev - 1);
      }, 10);
    } else {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, generationsToRun]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);
        const imageData = ctx.getImageData(0, 0, 16, 16);
        setTarget(loadTargetImage(imageData));
        setPopulation(generateInitialPopulation()); // Reiniciar población
        setGeneration(0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleEvolution = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setGeneration(0);
      setIsRunning(true);
    }
  };

  return (
    <div>
      <h1>Pixel Art Generativo</h1>
      <p>Generación: {generation}</p>

      <div>
        <label htmlFor="file-upload">Subir imagen objetivo:</label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
      </div>

      <div>
        <label htmlFor="num-generations">Generaciones a ejecutar:</label>
        <input
          id="num-generations"
          type="number"
          value={generationsToRun}
          onChange={(e) => setGenerationsToRun(Number(e.target.value))}
          disabled={isRunning}
        />
      </div>

      <button onClick={toggleEvolution} disabled={!population.length}>
        {isRunning ? "Detener Evolución" : "Iniciar Evolución"}
      </button>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div>
          <h2>Objetivo</h2>
          <PixelArtCanvas images={[]} target={target} />
        </div>
        <div>
          <h2>Mejor Individuo</h2>
          {population.length > 0 && (
            <PixelArtCanvas images={[population[0]]} target={[]} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
