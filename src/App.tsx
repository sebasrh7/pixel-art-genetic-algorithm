import { useEffect, useRef, useState } from "react";
import PixelArtCanvas from "./components/PixelArtCanvas";
import {
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
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Inicializar el worker
    const worker = new Worker(
      new URL("./workers/evolutionWorker.ts", import.meta.url),
      {
        type: "module", // Necesario para que funcione en un entorno de módulos
      }
    );
    workerRef.current = worker;

    // Escuchar mensajes del worker
    workerRef.current.onmessage = (event) => {
      const { type, worker_population, worker_generation } = event.data;

      if (type === "initialized") {
        setPopulation(worker_population);
      } else if (type === "generation") {
        setGeneration(worker_generation);
        setPopulation(worker_population);
      } else if (type === "done") {
        setIsRunning(false);
      }
    };

    // Limpiar el worker al desmontar el componente
    return () => workerRef.current?.terminate();
  }, []);

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

        const targetImage = loadTargetImage(imageData);
        setTarget(targetImage);

        workerRef.current?.postMessage({
          type: "initialize",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleEvolution = () => {
    if (isRunning) {
      setIsRunning(false);

      // Detener la evolución
      workerRef.current?.postMessage({
        type: "stop",
      });
    } else {
      // Validar que el número de generaciones sea mayor que 0
      if (generationsToRun <= 0) {
        alert("Por favor, ingresa un número válido de generaciones.");
        return;
      }

      if (!workerRef.current) return;

      setGeneration(0);
      setIsRunning(true);

      // Enviar el número de generaciones al worker
      workerRef.current.postMessage({
        type: "start",
        targetImage: target,
        generationsToRun,
      });
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
          <PixelArtCanvas target={target} />
        </div>
        <div>
          <h2>Mejor Individuo</h2>
          {population.length > 0 && (
            <PixelArtCanvas image={population[0]} target={[]} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

