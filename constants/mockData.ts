export type UserGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'eat_healthy' | 'manage_condition';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Restriction = 'gluten' | 'lactose' | 'diabetes' | 'hypertension' | 'none';

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: UserGoal;
  diet: DietType;
  activity: ActivityLevel;
  restrictions: Restriction[];
  dailyCalorieTarget: number;
  avatar?: string;
}

export interface NutrientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  iron: number;
  calcium: number;
  vitaminC: number;
  vitaminD: number;
  vitaminB12: number;
  potassium: number;
  magnesium: number;
}

export interface FoodAnalysis {
  id: string;
  imageUri: string;
  dish: string;
  cuisine: string;
  ingredients: string[];
  nutrients: NutrientInfo;
  score: number;
  scoreLabel: string;
  profileCompatibility: string;
  warnings: string[];
  benefits: string[];
  recommendation: string;
  timestamp: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface MealPlan {
  date: string;
  breakfast: MealSuggestion;
  lunch: MealSuggestion;
  dinner: MealSuggestion;
  snack: MealSuggestion;
}

export interface MealSuggestion {
  name: string;
  description: string;
  estimatedCalories: number;
  prepTime: number;
  tags: string[];
  imageQuery: string;
}

export const MOCK_ANALYSES: FoodAnalysis[] = [
  {
    id: '1',
    imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    dish: 'Buddha Bowl Mediterrâneo',
    cuisine: 'Mediterrânea',
    ingredients: ['Quinoa', 'Grão-de-bico', 'Abacate', 'Tomate cereja', 'Pepino', 'Azeite', 'Limão'],
    nutrients: {
      calories: 520, protein: 18, carbs: 62, fat: 22, fiber: 12,
      sugar: 8, sodium: 380, iron: 4.2, calcium: 95, vitaminC: 28,
      vitaminD: 0, vitaminB12: 0, potassium: 720, magnesium: 88,
    },
    score: 91,
    scoreLabel: 'Excelente',
    profileCompatibility: 'Muito compatível com seus objetivos',
    warnings: [],
    benefits: ['Rico em fibras', 'Proteína vegetal completa', 'Gorduras saudáveis do abacate', 'Baixo índice glicêmico'],
    recommendation: 'Prato ideal para o almoço. Excelente equilíbrio nutricional, rico em nutrientes essenciais.',
    timestamp: Date.now() - 86400000,
    meal: 'lunch',
  },
  {
    id: '2',
    imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    dish: 'Panquecas de Aveia com Frutas',
    cuisine: 'Internacional',
    ingredients: ['Aveia', 'Ovos', 'Banana', 'Mirtilos', 'Mel', 'Canela'],
    nutrients: {
      calories: 380, protein: 14, carbs: 58, fat: 9, fiber: 7,
      sugar: 22, sodium: 180, iron: 2.8, calcium: 120, vitaminC: 12,
      vitaminD: 1.2, vitaminB12: 0.8, potassium: 480, magnesium: 62,
    },
    score: 82,
    scoreLabel: 'Muito bom',
    profileCompatibility: 'Bom para o café da manhã',
    warnings: ['Açúcar moderado'],
    benefits: ['Energia sustentada', 'Antioxidantes dos mirtilos', 'Beta-glucana da aveia'],
    recommendation: 'Excelente opção para o café da manhã. Fornece energia de longa duração.',
    timestamp: Date.now() - 43200000,
    meal: 'breakfast',
  },
];

export const MOCK_MEAL_PLAN: MealPlan = {
  date: new Date().toISOString().split('T')[0],
  breakfast: {
    name: 'Smoothie Bowl de Açaí',
    description: 'Base de açaí com granola crocante, banana, morangos e mel',
    estimatedCalories: 340,
    prepTime: 10,
    tags: ['Antioxidante', 'Energia', 'Vitaminas'],
    imageQuery: 'acai bowl smoothie',
  },
  lunch: {
    name: 'Salada de Frango Grelhado',
    description: 'Peito de frango, folhas verdes, quinoa, tomate e vinagrete',
    estimatedCalories: 480,
    prepTime: 20,
    tags: ['Proteína', 'Low carb', 'Saciante'],
    imageQuery: 'grilled chicken salad quinoa',
  },
  dinner: {
    name: 'Salmão ao Vapor com Legumes',
    description: 'Salmão com brócolis, cenoura e batata-doce ao vapor',
    estimatedCalories: 520,
    prepTime: 25,
    tags: ['Ômega-3', 'Proteína', 'Antioxidante'],
    imageQuery: 'steamed salmon vegetables',
  },
  snack: {
    name: 'Mix de Castanhas e Frutas Secas',
    description: 'Castanha-do-pará, amêndoas, nozes e uva passa',
    estimatedCalories: 220,
    prepTime: 0,
    tags: ['Gorduras boas', 'Energia', 'Zinco'],
    imageQuery: 'mixed nuts dried fruits',
  },
};

export function generateAnalysis(imageUri: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodAnalysis {
  const options = [
    {
      dish: 'Filé de Tilápia com Arroz Integral',
      cuisine: 'Brasileira',
      ingredients: ['Tilápia', 'Arroz integral', 'Brócolis', 'Cenoura', 'Azeite', 'Limão', 'Alho'],
      nutrients: { calories: 450, protein: 38, carbs: 48, fat: 11, fiber: 6, sugar: 4, sodium: 340, iron: 2.1, calcium: 88, vitaminC: 42, vitaminD: 4.5, vitaminB12: 2.8, potassium: 680, magnesium: 74 },
      score: 88, scoreLabel: 'Muito bom',
      benefits: ['Alta proteína magra', 'Ômega-3', 'Vitamina D', 'Baixo colesterol'],
      warnings: [],
      recommendation: 'Excelente refeição equilibrada. Proteína de alta qualidade com carboidratos complexos.',
    },
    {
      dish: 'Wrap de Frango com Vegetais',
      cuisine: 'Mexicana',
      ingredients: ['Tortilla integral', 'Frango', 'Alface', 'Tomate', 'Queijo cottage', 'Pimentão'],
      nutrients: { calories: 410, protein: 32, carbs: 42, fat: 14, fiber: 5, sugar: 6, sodium: 520, iron: 3.2, calcium: 145, vitaminC: 35, vitaminD: 0.5, vitaminB12: 1.2, potassium: 520, magnesium: 58 },
      score: 78, scoreLabel: 'Bom',
      benefits: ['Proteína completa', 'Vitamina C', 'Cálcio'],
      warnings: ['Sódio moderado'],
      recommendation: 'Boa opção para o almoço. Atenção ao sódio se tiver restrição cardiovascular.',
    },
    {
      dish: 'Omelete de Espinafre com Cogumelos',
      cuisine: 'Internacional',
      ingredients: ['Ovos', 'Espinafre', 'Cogumelos', 'Queijo feta', 'Azeite', 'Ervas'],
      nutrients: { calories: 320, protein: 24, carbs: 8, fat: 21, fiber: 3, sugar: 3, sodium: 420, iron: 3.8, calcium: 180, vitaminC: 22, vitaminD: 2.1, vitaminB12: 1.9, potassium: 480, magnesium: 66 },
      score: 85, scoreLabel: 'Muito bom',
      benefits: ['Rica em ferro', 'Vitamina D', 'Low carb', 'Vitamina B12'],
      warnings: [],
      recommendation: 'Excelente para o café da manhã ou jantar leve. Proteína completa e nutrientes essenciais.',
    },
  ];
  const picked = options[Math.floor(Math.random() * options.length)];
  return {
    id: Date.now().toString(),
    imageUri,
    cuisine: picked.cuisine,
    ingredients: picked.ingredients,
    nutrients: picked.nutrients,
    score: picked.score,
    scoreLabel: picked.scoreLabel,
    profileCompatibility: 'Compatível com seu perfil',
    warnings: picked.warnings,
    benefits: picked.benefits,
    recommendation: picked.recommendation,
    timestamp: Date.now(),
    meal: mealType,
    dish: picked.dish,
  };
}
