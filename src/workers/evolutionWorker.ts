import { evolve, generateInitialPopulation, Individual } from "../utils/evolutionaryAlgorithm";

let worker_population: Individual[] = [];
let worker_generationsToRun = 0;

self.onmessage = (event) => {
  const { type, targetImage, generationsToRun } = event.data;
  switch (type) {
    case "initialize":
      // Generar la población inicial
      worker_population = generateInitialPopulation();
      worker_generationsToRun = 0;

      // Enviar la población inicial al componente principal
      self.postMessage({ type: "initialized", worker_population });
      break;

    case "start":
      worker_generationsToRun = generationsToRun;

      // Ejecutar las generaciones
      for (let i = 0; i < worker_generationsToRun; i++) {
        worker_population = evolve(worker_population, targetImage);

        // Enviar cada generación al componente principal
        self.postMessage({
          type: "generation",
          worker_generation: i + 1,
          worker_population,
        });
      }

      // Indicar que la evolución ha terminado
      self.postMessage({ type: "done" });
      break;

    case "stop":
      worker_generationsToRun = 0;
      self.postMessage({ type: "done" });
      break;

    default:
      console.error("Unknown message type:", type);
  }
};