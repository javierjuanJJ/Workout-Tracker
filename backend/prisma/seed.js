import prisma from '../models/prisma.client.js';

const EXERCISES = [
  { name: 'Sentadilla con barra', description: 'Sentadilla trasera con barra libre, enfocada a cuádriceps y glúteo.', muscleGroup: 'legs', category: 'strength' },
  { name: 'Peso muerto convencional', description: 'Levantamiento desde el suelo con barra, cadena posterior completa.', muscleGroup: 'back', category: 'strength' },
  { name: 'Press de banca', description: 'Press horizontal con barra en banco plano, pectoral y tríceps.', muscleGroup: 'chest', category: 'strength' },
  { name: 'Press militar de pie', description: 'Press vertical con barra desde los hombros, deltoides y core.', muscleGroup: 'shoulders', category: 'strength' },
  { name: 'Dominadas', description: 'Tracción corporal en barra fija con agarre prono.', muscleGroup: 'back', category: 'strength' },
  { name: 'Remo con barra', description: 'Remo encorvado con barra, dorsal y trapecio medio.', muscleGroup: 'back', category: 'strength' },
  { name: 'Curl de bíceps con mancuernas', description: 'Flexión de codo alterno con mancuernas.', muscleGroup: 'arms', category: 'strength' },
  { name: 'Extensión de tríceps en polea', description: 'Extensión de codo en polea alta con barra recta.', muscleGroup: 'arms', category: 'strength' },
  { name: 'Flexiones de brazos', description: 'Push-up clásico a peso corporal.', muscleGroup: 'chest', category: 'strength' },
  { name: 'Zancadas con mancuernas', description: 'Lunge caminando con mancuernas a los lados.', muscleGroup: 'legs', category: 'strength' },
  { name: 'Prensa de piernas', description: 'Empuje bilateral en máquina de prensa 45 grados.', muscleGroup: 'legs', category: 'strength' },
  { name: 'Elevación de talones', description: 'Gemelos de pie sobre escalón o máquina.', muscleGroup: 'legs', category: 'strength' },
  { name: 'Elevaciones laterales', description: 'Abducción de hombro con mancuernas.', muscleGroup: 'shoulders', category: 'strength' },
  { name: 'Face pull en polea', description: 'Tirón hacia la cara con cuerda, deltoide posterior.', muscleGroup: 'shoulders', category: 'strength' },
  { name: 'Plancha abdominal', description: 'Isométrico de core en apoyo de antebrazos.', muscleGroup: 'core', category: 'strength' },
  { name: 'Crunch abdominal', description: 'Flexión de tronco en suelo, recto abdominal.', muscleGroup: 'core', category: 'strength' },
  { name: 'Russian twist', description: 'Rotación de tronco sentado con disco o balón.', muscleGroup: 'core', category: 'strength' },
  { name: 'Burpees', description: 'Movimiento completo de squat, flexión y salto.', muscleGroup: 'full_body', category: 'cardio' },
  { name: 'Remo ergómetro 2000m', description: 'Series de remo indoor enfocadas a potencia aeróbica.', muscleGroup: 'full_body', category: 'cardio' },
  { name: 'Bicicleta estática HIIT', description: 'Intervalos 30/30 de alta intensidad en bike.', muscleGroup: 'legs', category: 'cardio' },
  { name: 'Carrera continua 5K', description: 'Trote constante a ritmo conversacional.', muscleGroup: 'legs', category: 'cardio' },
  { name: 'Movilidad de cadera 90/90', description: 'Secuencia de apertura de caderas en el suelo.', muscleGroup: 'full_body', category: 'mobility' },
];

async function main() {
  const result = await prisma.exercise.createMany({
    data: EXERCISES,
    skipDuplicates: true,
  });

  const total = await prisma.exercise.count();
  console.log(`Seed completado: ${result.count} ejercicios insertados (${total} totales en catálogo).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('Error ejecutando el seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
