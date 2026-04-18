import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Animated, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { UserProfile, UserGoal, DietType, ActivityLevel, Restriction, ProfileType } from '@/constants/mockData';

const { width, height } = Dimensions.get('window');

type OnboardingStep = 'welcome' | 'emotional' | 'profile_select' | 'tutorial1' | 'tutorial2' | 'tutorial3' | 'account' | 'quiz1' | 'quiz2' | 'quiz3' | 'quiz4' | 'quiz5' | 'done';

const STEPS: OnboardingStep[] = ['welcome', 'emotional', 'profile_select', 'tutorial1', 'tutorial2', 'tutorial3', 'account', 'quiz1', 'quiz2', 'quiz3', 'quiz4', 'quiz5', 'done'];

// Angolan food images
const ANGOLAN_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900', // grilled fish
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=900', // rice and beans
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900', // colorful food
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [profileType, setProfileType] = useState<ProfileType>('self');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightVal, setHeightVal] = useState('');
  const [goal, setGoal] = useState<UserGoal>('eat_healthy');
  const [diet, setDiet] = useState<DietType>('omnivore');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);

  const step = STEPS[stepIndex];
  const isQuiz = step.startsWith('quiz');

  const goNext = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStepIndex(i => Math.max(i - 1, 0));
  };

  const toggleRestriction = (r: Restriction) => {
    setRestrictions(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const finish = () => {
    const ageN = parseInt(age) || 25;
    const weightN = parseFloat(weight) || 70;
    const heightN = parseFloat(heightVal) || 170;
    let cals = 2000;
    if (goal === 'lose_weight') cals = 1600;
    else if (goal === 'gain_muscle') cals = 2500;

    const profile: UserProfile = {
      name: name || 'Utilizador',
      age: ageN,
      weight: weightN,
      height: heightN,
      goal,
      diet,
      activity,
      restrictions,
      dailyCalorieTarget: cals,
      profileType,
    };
    completeOnboarding(profile);
    router.replace('/(tabs)');
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900' }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.welcomeContent}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NUTRIÇÃO PERSONALIZADA</Text>
              </View>
              <Text style={styles.displayTitle}>NutriLens</Text>
              <Text style={styles.displaySubtitle}>
                O teu guia nutricional pessoal. Fotografa qualquer prato e descobre tudo sobre a tua alimentação.
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={goNext} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Começar a jornada</Text>
                <MaterialIcons name="arrow-forward" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
              <Text style={styles.loginHint}>Já tenho conta — <Text style={styles.loginLink}>Entrar</Text></Text>
            </View>
          </View>
        );

      case 'emotional':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900' }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={[styles.overlay, { backgroundColor: 'rgba(13,17,23,0.72)' }]} />
            <View style={styles.welcomeContent}>
              <View style={[styles.badge, { backgroundColor: Colors.accentMuted, borderColor: Colors.accent }]}>
                <Text style={[styles.badgeText, { color: Colors.accent }]}>A NOSSA MISSÃO</Text>
              </View>
              <Text style={[styles.displayTitle, { fontSize: FontSize.xxl, lineHeight: 32 }]}>
                Comer bem{'\n'}com o que tens{'\n'}na mesa 🍽️
              </Text>
              <Text style={[styles.displaySubtitle, { fontSize: FontSize.sm, lineHeight: 22 }]}>
                O NutriLens é o teu guia nutricional pessoal, criado para te ajudar a comer melhor com o que tens na mesa, prevenindo problemas como a anemia (falta de ferro) e fortalecendo a tua saúde, sem precisares de um nutricionista particular agora.
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={goNext} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Isso é para mim!</Text>
                <MaterialIcons name="favorite" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'profile_select':
        return (
          <View style={[styles.stepContainer, { justifyContent: 'flex-end' }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900' }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={[styles.overlay, { backgroundColor: 'rgba(13,17,23,0.6)' }]} />
            <View style={[styles.welcomeContent, { paddingTop: 28 }]}>
              <Text style={styles.profileSelectTitle}>Para quem vais{'\n'}cuidar hoje? 💚</Text>
              <Text style={styles.profileSelectSubtitle}>Escolhe o perfil para personalizar as recomendações</Text>

              <TouchableOpacity
                style={[styles.profileCard, profileType === 'self' && styles.profileCardActive]}
                onPress={() => { setProfileType('self'); setTimeout(goNext, 280); }}
                activeOpacity={0.85}
              >
                <Text style={styles.profileCardEmoji}>🧑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileCardTitle, profileType === 'self' && { color: Colors.primary }]}>Para Mim</Text>
                  <Text style={styles.profileCardDesc}>Quero ter mais energia, controlar o peso e viver com saúde.</Text>
                </View>
                {profileType === 'self' && <MaterialIcons name="check-circle" size={22} color={Colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileCard, profileType === 'child' && styles.profileCardActive]}
                onPress={() => { setProfileType('child'); setTimeout(goNext, 280); }}
                activeOpacity={0.85}
              >
                <Text style={styles.profileCardEmoji}>👶</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileCardTitle, profileType === 'child' && { color: Colors.primary }]}>Para o meu Filho(a)</Text>
                  <Text style={styles.profileCardDesc}>Cuide da alimentação do seu filho e garanta que ele cresça forte e saudável.</Text>
                </View>
                {profileType === 'child' && <MaterialIcons name="check-circle" size={22} color={Colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileCard, profileType === 'elder' && styles.profileCardActive]}
                onPress={() => { setProfileType('elder'); setTimeout(goNext, 280); }}
                activeOpacity={0.85}
              >
                <Text style={styles.profileCardEmoji}>👴</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileCardTitle, profileType === 'elder' && { color: Colors.primary }]}>Para o meu Avô/Avó</Text>
                  <Text style={styles.profileCardDesc}>Dê mais qualidade de vida e vitalidade para quem você ama. Nutrição para um envelhecimento activo.</Text>
                </View>
                {profileType === 'elder' && <MaterialIcons name="check-circle" size={22} color={Colors.primary} />}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'tutorial1':
        return (
          <TutorialStep
            imageUri="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900"
            icon="camera-alt"
            title="Fotografa qualquer refeição"
            description="Usa a câmara ou galeria para analisar pratos angolanos e internacionais. A nossa equipa identifica os ingredientes e os nutrientes de forma instantânea."
            onNext={goNext}
            onBack={goBack}
            pageNum={1}
          />
        );

      case 'tutorial2':
        return (
          <TutorialStep
            imageUri="https://images.unsplash.com/photo-1547592180-85f173990554?w=900"
            icon="insights"
            title="Análise nutricional completa"
            description="Recebe calorias, proteínas, ferro, vitaminas e minerais. Sabes se o prato é bom contra a anemia, se é adequado para diabetes ou hipertensão."
            onNext={goNext}
            onBack={goBack}
            pageNum={2}
          />
        );

      case 'tutorial3':
        return (
          <TutorialStep
            imageUri="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900"
            icon="event-note"
            title="Plano alimentar personalizado"
            description="Recebe sugestões de refeições angolanas e internacionais para cada momento do dia, baseadas nos teus objectivos e condições de saúde."
            onNext={goNext}
            onBack={goBack}
            pageNum={3}
            isLast
          />
        );

      case 'account':
        return (
          <KeyboardAvoidingView style={styles.stepContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={goBack} style={{ marginBottom: 16 }}>
                <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.quizHeader}>
                <Text style={styles.quizTitle}>Criar a tua conta</Text>
                <Text style={styles.quizSubtitle}>Os teus dados são usados apenas para personalizar a tua experiência nutricional.</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="O teu nome"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="teu@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                />
              </View>
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Idade</Text>
                  <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="25" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Peso (kg)</Text>
                  <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="70" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Altura (cm)</Text>
                <TextInput style={styles.input} value={heightVal} onChangeText={setHeightVal} placeholder="170" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
              </View>
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={goNext}>
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <MaterialIcons name="arrow-forward" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'quiz1':
        return (
          <QuizStep progress={1 / 5} emoji="🎯" title="Qual é o teu principal objectivo?" onBack={goBack}>
            {([
              { val: 'lose_weight', label: 'Perder peso', desc: 'Quero reduzir a minha gordura corporal', icon: 'trending-down' },
              { val: 'gain_muscle', label: 'Ganhar massa', desc: 'Quero aumentar a minha musculatura', icon: 'fitness-center' },
              { val: 'maintain', label: 'Manter a forma', desc: 'Quero manter o meu peso actual', icon: 'balance' },
              { val: 'eat_healthy', label: 'Comer melhor', desc: 'Quero melhorar a minha qualidade de vida', icon: 'spa' },
              { val: 'manage_condition', label: 'Controlar saúde', desc: 'Tenho condição de saúde específica', icon: 'favorite' },
            ] as Array<{ val: UserGoal; label: string; desc: string; icon: string }>).map(opt => (
              <TouchableOpacity
                key={opt.val}
                style={[styles.quizOption, goal === opt.val && styles.quizOptionSelected]}
                onPress={() => { setGoal(opt.val); setTimeout(goNext, 300); }}
              >
                <MaterialIcons name={opt.icon as any} size={22} color={goal === opt.val ? Colors.primary : Colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.quizOptionLabel, goal === opt.val && { color: Colors.primary }]}>{opt.label}</Text>
                  <Text style={styles.quizOptionDesc}>{opt.desc}</Text>
                </View>
                {goal === opt.val && <MaterialIcons name="check-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </QuizStep>
        );

      case 'quiz2':
        return (
          <QuizStep progress={2 / 5} emoji="🥗" title="Como preferes alimentar-te?" onBack={goBack}>
            {([
              { val: 'omnivore', label: 'Como de tudo', desc: 'Carne, peixe, vegetais — sem restrições', icon: 'restaurant' },
              { val: 'vegetarian', label: 'Vegetariano', desc: 'Sem carne, mas como ovos e laticínios', icon: 'eco' },
              { val: 'vegan', label: 'Vegano', desc: 'Nenhum produto de origem animal', icon: 'grass' },
              { val: 'keto', label: 'Baixo carboidrato', desc: 'Poucos carboidratos, mais proteína e gordura', icon: 'whatshot' },
              { val: 'mediterranean', label: 'Equilibrado', desc: 'Variedade com foco em alimentos naturais', icon: 'waves' },
            ] as Array<{ val: DietType; label: string; desc: string; icon: string }>).map(opt => (
              <TouchableOpacity
                key={opt.val}
                style={[styles.quizOption, diet === opt.val && styles.quizOptionSelected]}
                onPress={() => { setDiet(opt.val); setTimeout(goNext, 300); }}
              >
                <MaterialIcons name={opt.icon as any} size={22} color={diet === opt.val ? Colors.primary : Colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.quizOptionLabel, diet === opt.val && { color: Colors.primary }]}>{opt.label}</Text>
                  <Text style={styles.quizOptionDesc}>{opt.desc}</Text>
                </View>
                {diet === opt.val && <MaterialIcons name="check-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </QuizStep>
        );

      case 'quiz3':
        return (
          <QuizStep progress={3 / 5} emoji="💪" title="Qual é o teu nível de actividade física?" onBack={goBack}>
            {([
              { val: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício', icon: 'weekend' },
              { val: 'light', label: 'Leve', desc: 'Caminhadas ou exercício leve 1-3x por semana', icon: 'directions-walk' },
              { val: 'moderate', label: 'Moderado', desc: 'Exercício regular 3-5x por semana', icon: 'directions-bike' },
              { val: 'active', label: 'Activo', desc: 'Exercício intenso quase todos os dias', icon: 'directions-run' },
              { val: 'very_active', label: 'Muito activo', desc: 'Treino intenso diário ou trabalho físico', icon: 'sports' },
            ] as Array<{ val: ActivityLevel; label: string; desc: string; icon: string }>).map(opt => (
              <TouchableOpacity
                key={opt.val}
                style={[styles.quizOption, activity === opt.val && styles.quizOptionSelected]}
                onPress={() => { setActivity(opt.val); setTimeout(goNext, 300); }}
              >
                <MaterialIcons name={opt.icon as any} size={22} color={activity === opt.val ? Colors.primary : Colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.quizOptionLabel, activity === opt.val && { color: Colors.primary }]}>{opt.label}</Text>
                  <Text style={styles.quizOptionDesc}>{opt.desc}</Text>
                </View>
                {activity === opt.val && <MaterialIcons name="check-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </QuizStep>
        );

      case 'quiz4':
        return (
          <QuizStep progress={4 / 5} emoji="⚠️" title="Tens alguma restrição ou condição?" subtitle="Selecciona todas que se aplicam" onBack={goBack}>
            {([
              { val: 'gluten', label: 'Intolerância ao glúten', desc: 'Doença celíaca ou sensibilidade', icon: 'no-meals' },
              { val: 'lactose', label: 'Intolerância à lactose', desc: 'Dificuldade com laticínios', icon: 'block' },
              { val: 'diabetes', label: 'Diabetes', desc: 'Controlo do açúcar no sangue', icon: 'monitor-heart' },
              { val: 'hypertension', label: 'Hipertensão', desc: 'Pressão alta - controlo de sódio', icon: 'favorite-border' },
              { val: 'none', label: 'Nenhuma restrição', desc: 'Sem condições específicas', icon: 'check-circle-outline' },
            ] as Array<{ val: Restriction; label: string; desc: string; icon: string }>).map(opt => (
              <TouchableOpacity
                key={opt.val}
                style={[styles.quizOption, restrictions.includes(opt.val) && styles.quizOptionSelected]}
                onPress={() => toggleRestriction(opt.val)}
              >
                <MaterialIcons name={opt.icon as any} size={22} color={restrictions.includes(opt.val) ? Colors.primary : Colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.quizOptionLabel, restrictions.includes(opt.val) && { color: Colors.primary }]}>{opt.label}</Text>
                  <Text style={styles.quizOptionDesc}>{opt.desc}</Text>
                </View>
                {restrictions.includes(opt.val) && <MaterialIcons name="check-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={goNext}>
              <Text style={styles.primaryBtnText}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.textInverse} />
            </TouchableOpacity>
          </QuizStep>
        );

      case 'quiz5':
        return (
          <QuizStep progress={5 / 5} emoji="🔔" title="Activar lembretes de refeição?" subtitle="Recebe notificações nos melhores horários" onBack={goBack}>
            <View style={styles.notifCard}>
              <MaterialIcons name="notifications-active" size={32} color={Colors.primary} />
              <Text style={styles.notifTitle}>Lembretes personalizados</Text>
              <Text style={styles.notifDesc}>Café da manhã, almoço, jantar e lanches no horário certo para ti. Nunca mais te esqueças de comer bem!</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
              <MaterialIcons name="notifications" size={20} color={Colors.textInverse} />
              <Text style={styles.primaryBtnText}>Activar notificações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={goNext}>
              <Text style={styles.secondaryBtnText}>Agora não</Text>
            </TouchableOpacity>
          </QuizStep>
        );

      case 'done':
        return (
          <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
            <View style={styles.doneIconWrap}>
              <MaterialIcons name="check" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.doneTitle}>Tudo pronto!</Text>
            <Text style={styles.doneSubtitle}>
              O teu perfil foi criado com sucesso. Começa por fotografar a tua próxima refeição!
            </Text>
            <View style={styles.doneSummary}>
              <SummaryItem icon="person" label="Cuidar de" value={
                profileType === 'self' ? 'Mim mesmo' :
                profileType === 'child' ? 'Filho(a)' : 'Avô/Avó'
              } />
              <SummaryItem icon="flag" label="Objectivo" value={
                goal === 'lose_weight' ? 'Perder peso' :
                goal === 'gain_muscle' ? 'Ganhar massa' :
                goal === 'maintain' ? 'Manter forma' :
                goal === 'eat_healthy' ? 'Comer melhor' : 'Controlar saúde'
              } />
              <SummaryItem icon="restaurant" label="Alimentação" value={
                diet === 'omnivore' ? 'Como de tudo' :
                diet === 'vegetarian' ? 'Vegetariano' :
                diet === 'vegan' ? 'Vegano' :
                diet === 'keto' ? 'Baixo carboidrato' : 'Equilibrado'
              } />
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24, width: '100%' }]} onPress={finish}>
              <Text style={styles.primaryBtnText}>Ir para o app</Text>
              <MaterialIcons name="rocket-launch" size={20} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        {renderStep()}
      </Animated.View>
    </View>
  );
}

function TutorialStep({ imageUri, icon, title, description, onNext, onBack, pageNum, isLast }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: imageUri }} style={{ width, height: height * 0.52 }} contentFit="cover" />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.52, backgroundColor: 'rgba(13,17,23,0.3)' }} />
      <View style={{ flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24, paddingTop: 28 }}>
        <View style={styles.tutorialDots}>
          {[1, 2, 3].map(n => (
            <View key={n} style={[styles.dot, n === pageNum && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.tutorialIconRow}>
          <View style={styles.tutorialIcon}>
            <MaterialIcons name={icon} size={22} color={Colors.primary} />
          </View>
        </View>
        <Text style={styles.tutorialTitle}>{title}</Text>
        <Text style={styles.tutorialDesc}>{description}</Text>
        <View style={styles.tutorialActions}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginLeft: 12 }]} onPress={onNext}>
            <Text style={styles.primaryBtnText}>{isLast ? 'Criar conta' : 'Próximo'}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function QuizStep({ progress, emoji, title, subtitle, children, onBack }: any) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 16 }}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{Math.round(progress * 5)}/5</Text>
        <Text style={styles.quizEmoji}>{emoji}</Text>
        <Text style={styles.quizTitle}>{title}</Text>
        {subtitle ? <Text style={styles.quizSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={{ paddingHorizontal: 24, marginTop: 20, gap: 10 }}>
        {children}
      </View>
    </ScrollView>
  );
}

function SummaryItem({ icon, label, value }: any) {
  return (
    <View style={styles.summaryItem}>
      <MaterialIcons name={icon} size={16} color={Colors.primary} />
      <Text style={styles.summaryLabel}>{label}:</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stepContainer: { flex: 1 },
  heroImage: { width, height, position: 'absolute', top: 0 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,17,23,0.52)' },
  welcomeContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, paddingBottom: 48, paddingTop: 32,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl,
  },
  badge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.primary,
  },
  badgeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1.5 },
  displayTitle: { fontSize: FontSize.display, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 10 },
  displaySubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24, marginBottom: 28 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 15, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textInverse },
  loginHint: { textAlign: 'center', color: Colors.textSecondary, marginTop: 16, fontSize: FontSize.sm },
  loginLink: { color: Colors.primary, fontWeight: FontWeight.semibold },
  // Profile Select
  profileSelectTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 6, lineHeight: 34 },
  profileSelectSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: Colors.surfaceBorder,
  },
  profileCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  profileCardEmoji: { fontSize: 32 },
  profileCardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 3 },
  profileCardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  // Tutorial
  tutorialDots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.surfaceBorder },
  dotActive: { width: 20, backgroundColor: Colors.primary },
  tutorialIconRow: { flexDirection: 'row', marginBottom: 12 },
  tutorialIcon: {
    width: 42, height: 42, borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
  },
  tutorialTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 10 },
  tutorialDesc: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  tutorialActions: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  backBtn: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  // Quiz
  quizContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  quizHeader: { marginBottom: 8 },
  quizTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  quizSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  quizEmoji: { fontSize: 40, marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 20 },
  quizOption: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  quizOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  quizOptionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  quizOptionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: 14,
    fontSize: FontSize.base, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  rowInputs: { flexDirection: 'row' },
  notifCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  notifTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 12, marginBottom: 8 },
  notifDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  secondaryBtn: {
    borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: Radius.full,
    paddingVertical: 14, marginTop: 12, alignItems: 'center',
  },
  secondaryBtnText: { fontSize: FontSize.base, color: Colors.textSecondary },
  doneIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, borderWidth: 2, borderColor: Colors.primary,
  },
  doneTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 12 },
  doneSubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  doneSummary: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 20, gap: 12, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
});
