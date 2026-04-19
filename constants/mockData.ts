export type UserGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'eat_healthy' | 'manage_condition';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Restriction = 'gluten' | 'lactose' | 'diabetes' | 'hypertension' | 'none';
export type ProfileType = 'self' | 'child' | 'elder';

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
  profileType?: ProfileType;
  avatar?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  profileType: ProfileType;
  emoji: string;
  color: string;
  goal: UserGoal;
  restrictions: Restriction[];
  dailyCalorieTarget: number;
  age?: number;
  weight?: number;
  height?: number;
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

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
  enrolled: boolean;
  daysCompleted: number;
  totalDays: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorEmoji: string;
  authorLocation: string;
  imageUri: string;
  dishName: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  tags: string[];
  liked: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'specialist';
  text: string;
  timestamp: number;
  type: 'text' | 'tip' | 'alert';
}

export const DAILY_TIPS = [
  'Sabias que comer uma laranja depois do almoço ajuda o corpo a absorver o ferro do feijão? Combate a anemia!',
  'O funge de milho é rico em energia! Combina muito bem com vegetais verdes para equilibrar os nutrientes.',
  'Beber água antes das refeições ajuda a controlar as porções e melhora a digestão. Tenta beber 2L por dia!',
  'O peixe fresco é uma das melhores fontes de proteína e ómega-3. O Mufete é uma refeição quase perfeita!',
  'As folhas de mandioca (saka-saka) são riquíssimas em ferro e cálcio. Um superfood angolano!',
  'Comer devagar e mastigar bem os alimentos melhora a digestão e dá sensação de saciedade mais cedo.',
  'O amendoim é rico em gorduras saudáveis e proteínas. Um punhado por dia faz bem ao coração!',
  'Incluir quiabo nas refeições ajuda a controlar o açúcar no sangue — excelente para quem tem diabetes.',
  'O mel angolano puro tem propriedades anti-inflamatórias naturais. Usa-o em vez do açúcar refinado!',
  'A banana da terra cozida é uma excelente fonte de energia lenta — perfeita para o almoço e jantar.',
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: '7 Dias Sem Açúcar',
    description: 'Elimina açúcares adicionados durante uma semana. O teu corpo vai agradecer!',
    duration: '7 dias',
    icon: 'no-food',
    color: '#EF4444',
    enrolled: true,
    daysCompleted: 3,
    totalDays: 7,
  },
  {
    id: 'c2',
    title: 'Hidratação Total',
    description: 'Bebe pelo menos 8 copos de água por dia durante 14 dias. Energia e pele renovada!',
    duration: '14 dias',
    icon: 'water-drop',
    color: '#38BDF8',
    enrolled: false,
    daysCompleted: 0,
    totalDays: 14,
  },
  {
    id: 'c3',
    title: 'Café da Manhã Campeão',
    description: 'Toma um café da manhã completo (proteína + fruta + carboidrato) por 5 dias seguidos.',
    duration: '5 dias',
    icon: 'wb-sunny',
    color: '#F59E0B',
    enrolled: false,
    daysCompleted: 0,
    totalDays: 5,
  },
  {
    id: 'c4',
    title: '30 Dias de Legumes',
    description: 'Inclui pelo menos uma porção de legumes em cada refeição principal durante 30 dias.',
    duration: '30 dias',
    icon: 'eco',
    color: '#4ADE80',
    enrolled: false,
    daysCompleted: 0,
    totalDays: 30,
  },
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    authorName: 'Maria Domingos',
    authorEmoji: '👩🏾',
    authorLocation: 'Luanda',
    imageUri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    dishName: 'Mufete da minha mãe',
    caption: 'Troquei o sal refinado pelo sal marinho e adicionei mais limão. O peixe ficou mais leve e sinto-me com muito mais energia depois do almoço! 💚',
    likes: 142,
    comments: 23,
    timeAgo: '2h atrás',
    tags: ['Mufete', 'SaúdeAngolana', 'SemSal'],
    liked: false,
  },
  {
    id: 'p2',
    authorName: 'João Mateus',
    authorEmoji: '👨🏿',
    authorLocation: 'Benguela',
    imageUri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
    dishName: 'Feijão com arroz integral',
    caption: 'Mudei o arroz branco pelo integral há 3 semanas. Perdi 2kg sem fazer dieta e tenho muito menos fome ao longo do dia. Experimentem! 🙌',
    likes: 98,
    comments: 15,
    timeAgo: '5h atrás',
    tags: ['ArrozIntegral', 'PerdaPeso', 'DicaReal'],
    liked: true,
  },
  {
    id: 'p3',
    authorName: 'Ana Carla',
    authorEmoji: '👩🏽',
    authorLocation: 'Huambo',
    imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
    dishName: 'Calulu de legumes',
    caption: 'Versão vegetariana do Calulu com cogumelos no lugar do peixe seco. Ficou incrível! A nutricionista disse que está cheio de ferro e vitaminas. Recomendo! 🌿',
    likes: 201,
    comments: 41,
    timeAgo: '1d atrás',
    tags: ['Vegetariano', 'Calulu', 'Angola'],
    liked: false,
  },
  {
    id: 'p4',
    authorName: 'Pai Zeco',
    authorEmoji: '👴🏿',
    authorLocation: 'Namibe',
    imageUri: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
    dishName: 'Sopa de legumes com osso',
    caption: 'Com 68 anos e hipertensão, aprendi que a sopa de legumes caseira controla a pressão melhor que qualquer remédio. O app ajudou-me a descobrir isto! ❤️',
    likes: 334,
    comments: 67,
    timeAgo: '2d atrás',
    tags: ['Idosos', 'Hipertensão', 'Sopa', 'Cura'],
    liked: false,
  },
  {
    id: 'p5',
    authorName: 'Celeste Neto',
    authorEmoji: '👩🏾',
    authorLocation: 'Cabinda',
    imageUri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    dishName: 'Papaia com mel e granola',
    caption: 'Troquei o açúcar pelo mel angolano no meu pequeno-almoço. Sem açúcar há 1 semana e já perdi 800g! O desafio do NutriLens mudou a minha vida. 🍯',
    likes: 176,
    comments: 29,
    timeAgo: '3d atrás',
    tags: ['Mel', 'SemAcucar', 'Desafio7Dias'],
    liked: false,
  },
];

export const SPECIALIST_RESPONSES: string[] = [
  'Olá! Sou a Dra. Fátima, nutricionista da nossa equipa. Em que posso ajudá-lo hoje? 😊',
  'Excelente pergunta! Com base no que descreve, recomendamos incluir mais alimentos ricos em ferro como feijão, saka-saka e peixe. Isto é especialmente importante para o contexto angolano onde a anemia é frequente.',
  'Compreendo a sua preocupação. Para o seu perfil, o ideal seria fazer 5 refeições pequenas ao longo do dia, evitando longos períodos sem comer. Quer que elaboremos um plano personalizado?',
  'O seu IMC está dentro dos valores saudáveis. Continue com os hábitos actuais e foque-se em manter a hidratação — pelo menos 2L de água por dia é essencial, especialmente nas cidades mais quentes como Namibe e Malanje.',
  'Para combater a anemia, a combinação de feijão com vitamina C (laranja, limão) aumenta a absorção de ferro em até 3 vezes. É uma dica simples que faz uma grande diferença!',
  'A nossa equipa está sempre disponível para si. Partilhe uma foto do prato e fazemos a análise nutricional completa gratuitamente. É o nosso compromisso com a saúde da família angolana! 💚',
];

// Angolan food images via Unsplash
export const MOCK_ANALYSES: FoodAnalysis[] = [
  {
    id: '1',
    imageUri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    dish: 'Mufete com Funge',
    cuisine: 'Angolana',
    ingredients: ['Peixe grelhado', 'Funge de milho', 'Feijão de óleo de palma', 'Banana da terra', 'Cebola', 'Alho'],
    nutrients: {
      calories: 620, protein: 42, carbs: 68, fat: 18, fiber: 8,
      sugar: 5, sodium: 420, iron: 5.2, calcium: 110, vitaminC: 18,
      vitaminD: 5.5, vitaminB12: 3.2, potassium: 820, magnesium: 96,
    },
    score: 91,
    scoreLabel: 'Excelente',
    profileCompatibility: 'Muito compatível com os teus objectivos',
    warnings: [],
    benefits: ['Rica em proteína de peixe', 'Ferro do feijão', 'Vitamina D', 'Energia sustentada do funge'],
    recommendation: 'Prato tipicamente angolano com excelente equilíbrio nutricional. Ideal para o almoço!',
    timestamp: Date.now() - 86400000,
    meal: 'lunch',
  },
  {
    id: '2',
    imageUri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
    dish: 'Arroz com Feijão e Frango',
    cuisine: 'Angolana',
    ingredients: ['Arroz', 'Feijão vermelho', 'Frango grelhado', 'Óleo de palma', 'Cebola', 'Alho', 'Tomate'],
    nutrients: {
      calories: 540, protein: 36, carbs: 72, fat: 12, fiber: 10,
      sugar: 6, sodium: 380, iron: 6.8, calcium: 95, vitaminC: 22,
      vitaminD: 1.2, vitaminB12: 1.8, potassium: 680, magnesium: 88,
    },
    score: 85,
    scoreLabel: 'Muito bom',
    profileCompatibility: 'Bom para energia e combate à anemia',
    warnings: ['Óleo de palma em moderação'],
    benefits: ['Rico em ferro - combate à anemia', 'Proteína completa', 'Fibras do feijão'],
    recommendation: 'Uma das melhores combinações da culinária angolana! O feijão com arroz forma uma proteína completa.',
    timestamp: Date.now() - 43200000,
    meal: 'lunch',
  },
];

export const MOCK_MEAL_PLAN: MealPlan = {
  date: new Date().toISOString().split('T')[0],
  breakfast: {
    name: 'Papaia com Iogurte e Mel',
    description: 'Fatias de papaia fresca com iogurte natural, mel e granola. Leve, nutritivo e energizante para começar o dia.',
    estimatedCalories: 280,
    prepTime: 5,
    tags: ['Vitamina C', 'Probióticos', 'Energia'],
    imageQuery: 'papaya yogurt breakfast',
  },
  lunch: {
    name: 'Mufete Completo',
    description: 'Peixe grelhado (tilápia ou cacusso), funge de milho, feijão de óleo de palma e banana da terra. O prato mais nutritivo de Angola!',
    estimatedCalories: 620,
    prepTime: 35,
    tags: ['Proteína', 'Ferro', 'Energia', 'Tradicional'],
    imageQuery: 'grilled fish with beans rice',
  },
  dinner: {
    name: 'Calulu de Peixe com Arroz',
    description: 'Guisado de peixe com quiabo, tomate, cebola e especiarias angolanas, acompanhado de arroz branco.',
    estimatedCalories: 480,
    prepTime: 30,
    tags: ['Ómega-3', 'Antioxidante', 'Leveza'],
    imageQuery: 'fish stew okra vegetables',
  },
  snack: {
    name: 'Amendoim Torrado com Fruta',
    description: 'Um punhado de amendoim torrado sem sal com uma banana ou manga. Snack angolano perfeito!',
    estimatedCalories: 220,
    prepTime: 0,
    tags: ['Gorduras boas', 'Energia', 'Natural'],
    imageQuery: 'roasted peanuts tropical fruit',
  },
};

export function generateAnalysis(imageUri: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodAnalysis {
  const options = [
    {
      dish: 'Calulu de Peixe com Quiabo',
      cuisine: 'Angolana',
      ingredients: ['Peixe seco', 'Quiabo', 'Tomate', 'Cebola', 'Óleo de palma', 'Folhas de mandioca', 'Alho'],
      nutrients: { calories: 480, protein: 38, carbs: 32, fat: 16, fiber: 8, sugar: 4, sodium: 480, iron: 6.2, calcium: 120, vitaminC: 38, vitaminD: 4.0, vitaminB12: 2.8, potassium: 720, magnesium: 88 },
      score: 90, scoreLabel: 'Excelente',
      benefits: ['Muito rico em ferro - combate a anemia', 'Proteína completa do peixe', 'Fibras do quiabo', 'Vitaminas das folhas de mandioca'],
      warnings: [],
      recommendation: 'Excelente prato tradicional! As folhas de mandioca são um superfood rico em ferro e cálcio.',
    },
    {
      dish: 'Arroz com Feijão e Frango Grelhado',
      cuisine: 'Angolana',
      ingredients: ['Arroz branco', 'Feijão vermelho', 'Frango grelhado', 'Cebola', 'Tomate', 'Alho', 'Coentros'],
      nutrients: { calories: 540, protein: 42, carbs: 65, fat: 10, fiber: 10, sugar: 5, sodium: 350, iron: 6.8, calcium: 85, vitaminC: 22, vitaminD: 0.8, vitaminB12: 1.6, potassium: 640, magnesium: 76 },
      score: 86, scoreLabel: 'Muito bom',
      benefits: ['Combinação perfeita de proteínas', 'Rico em ferro contra anemia', 'Fibras do feijão para digestão'],
      warnings: [],
      recommendation: 'Combinação clássica e muito nutritiva! Juntos, o feijão e o arroz formam uma proteína completa.',
    },
    {
      dish: 'Mufete com Funge de Milho',
      cuisine: 'Angolana',
      ingredients: ['Peixe cacusso grelhado', 'Funge de milho', 'Feijão de azeite', 'Banana da terra cozida', 'Limão', 'Cebola'],
      nutrients: { calories: 620, protein: 44, carbs: 70, fat: 18, fiber: 9, sugar: 6, sodium: 410, iron: 5.8, calcium: 105, vitaminC: 20, vitaminD: 5.8, vitaminB12: 3.4, potassium: 850, magnesium: 98 },
      score: 93, scoreLabel: 'Excelente',
      benefits: ['O prato mais nutritivo de Angola!', 'Vitamina D do peixe', 'Ferro do feijão combate anemia', 'Energia de longa duração do funge'],
      warnings: [],
      recommendation: 'O Mufete é considerado um dos pratos mais completos nutricionalmente! Perfeito para um almoço cheio de energia.',
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
    profileCompatibility: 'Compatível com o teu perfil',
    warnings: picked.warnings,
    benefits: picked.benefits,
    recommendation: picked.recommendation,
    timestamp: Date.now(),
    meal: mealType,
    dish: picked.dish,
  };
}
