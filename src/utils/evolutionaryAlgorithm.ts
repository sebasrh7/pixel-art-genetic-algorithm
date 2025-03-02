type Pixel = [number, number, number]; // RGB
export type ImageMatrix = Pixel[][];

export interface Individual {
  image: ImageMatrix;
  fitness: number;
}

const IMAGE_WIDTH = 16;
const IMAGE_HEIGHT = 16;
const POPULATION_SIZE = 50; // Aumentamos el tamaño de la población
const MUTATION_RATE = 0.1;

// Variable para almacenar la imagen objetivo
let targetImage: ImageMatrix | null = null;

// Función para generar un color aleatorio (usada solo al iniciar la imagen)
function randomColor(): Pixel {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
}

// Generar imagen aleatoria
function generateRandomImage(): ImageMatrix {
  const image: ImageMatrix = [];
  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    const row: Pixel[] = [];
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      row.push(randomColor());
    }
    image.push(row);
  }
  return image;
}

// Calcular fitness: la diferencia total entre el individuo y la imagen objetivo
function calculateFitness(image: ImageMatrix): number {
  if (!targetImage) return 0;

  let totalDifference = 0;
  // Máxima diferencia posible (distancia Euclídea máxima para cada píxel)
  const maxDifference =
    IMAGE_WIDTH * IMAGE_HEIGHT * Math.sqrt(255 ** 2 + 255 ** 2 + 255 ** 2);

  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      const [r1, g1, b1] = image[y][x];
      const [r2, g2, b2] = targetImage[y][x];
      const difference = Math.sqrt(
        (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
      );
      totalDifference += difference;
    }
  }

  // Fitness entre 0 y 1 (cuanto más se acerca a 1, mejor)
  const fitness = 1 - totalDifference / maxDifference;
  return fitness;
}

// Función para ajustar ligeramente un color (mutación más “suave”)
function adjustColor(color: number): number {
  // Cambio aleatorio en el rango [-20, 20]
  const change = Math.floor((Math.random() - 0.5) * 40);
  let newColor = color + change;
  return Math.max(0, Math.min(255, newColor));
}

// Mutación: en lugar de asignar un color completamente aleatorio, ajustamos el existente
function mutate(image: ImageMatrix): ImageMatrix {
  const newImage: ImageMatrix = image.map((row) =>
    row.map((pixel) => {
      if (Math.random() < MUTATION_RATE) {
        // Mutamos cada componente de forma gradual
        const [r, g, b] = pixel;
        return [adjustColor(r), adjustColor(g), adjustColor(b)] as Pixel;
      }
      return pixel;
    })
  );
  return newImage;
}

// Cruce: se elige píxel a píxel de cada padre
function crossover(parent1: ImageMatrix, parent2: ImageMatrix): ImageMatrix {
  const child: ImageMatrix = [];
  for (let y = 0; y < IMAGE_HEIGHT; y++) {
    const row: Pixel[] = [];
    for (let x = 0; x < IMAGE_WIDTH; x++) {
      // También podrías experimentar con cruces por bloques (por ejemplo, regiones de la imagen)
      row.push(Math.random() < 0.5 ? parent1[y][x] : parent2[y][x]);
    }
    child.push(row);
  }
  return child;
}

// Selección de padres mediante ruleta (proporcional al fitness)
function selectParent(survivors: Individual[]): Individual {
  const totalFitness = survivors.reduce((sum, ind) => sum + ind.fitness, 0);
  const threshold = Math.random() * totalFitness;
  let cumulative = 0;
  for (const ind of survivors) {
    cumulative += ind.fitness;
    if (cumulative >= threshold) {
      return ind;
    }
  }
  // En caso de redondeos, devolvemos el último
  return survivors[survivors.length - 1];
}

// Generar la población inicial
export function generateInitialPopulation(): Individual[] {
  const population: Individual[] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const image = generateRandomImage();
    const fitness = calculateFitness(image);
    population.push({ image, fitness });
  }
  return population;
}

// Evolución de la población
export function evolve(population: Individual[]): Individual[] {
  // Ordenar por fitness descendente (mayor primero)
  population.sort((a, b) => b.fitness - a.fitness);
  const best = population[0]; // Guardamos el mejor para elitismo

  // Seleccionar a los sobrevivientes (por ejemplo, la mitad superior)
  const survivors = population.slice(0, Math.floor(POPULATION_SIZE / 2));

  const newGeneration: Individual[] = [];
  // Elitismo: mantener el mejor individuo sin cambios
  newGeneration.push(best);

  // Crear el resto de la nueva generación
  while (newGeneration.length < POPULATION_SIZE) {
    const parent1 = selectParent(survivors);
    const parent2 = selectParent(survivors);
    let childImage = crossover(parent1.image, parent2.image);
    childImage = mutate(childImage);
    const fitness = calculateFitness(childImage);
    newGeneration.push({ image: childImage, fitness });
  }

  // Ordenamos la nueva generación para mantener el orden (opcional)
  newGeneration.sort((a, b) => b.fitness - a.fitness);
  return newGeneration;
}

// Cargar imagen objetivo desde un ImageData (por ejemplo, redimensionada a 16×16)
export function loadTargetImage(imageData: ImageData): ImageMatrix {
  const { width, height, data } = imageData;
  const target: ImageMatrix = [];

  for (let y = 0; y < height; y++) {
    const row: Pixel[] = [];
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      row.push([r, g, b]);
    }
    target.push(row);
  }

  targetImage = target; // Se asigna la imagen objetivo para el cálculo de fitness
  return target;
}
