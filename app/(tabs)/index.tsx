import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { MOCK_MEAL_PLAN, MOCK_CHALLENGES, DAILY_TIPS } from '@/constants/mockData';

const { width } = Dimensions.get('window');

const MEAL_IMAGES: Record<string, string> = {
  breakfast: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
  lunch: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  dinner: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
  snack: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

const MEAL_TIMES: Record<string, string> = {
  breakfast: '07:00',
  lunch: '12:30',
  dinner: '19:00',
  snack: '15:30',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, analyses, currentStreak, totalScanned, dailyCaloriesConsumed } = useApp();
  const [selectedMeal, setSelectedMeal] = useState<string>('lunch');

  const calorieTarget = user?.dailyCalorieTarget || 2000;
  const caloriePercent = Math.min(dailyCaloriesConsumed / calorieTarget, 1);
  const recentAnalyses = analyses.slice(0, 3);

  const today = new Date();
  const dayName = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  // Rotate daily tip based on day of month
  const dailyTip = DAILY_TIPS[today.getDate() % DAILY_TIPS.length];

  const goalLabels: Record<string, string> = {
    lose_weight: 'Perder peso', gain_muscle: 'Ganhar massa',
    maintain: 'Manter forma', eat_healthy: 'Comer melhor', manage_condition: 'Controlar saúde',
  };

  const meals = [
    { key: 'breakfast', plan: MOCK_MEAL_PLAN.breakfast },
    { key: 'lunch', plan: MOCK_MEAL_PLAN.lunch },
    { key: 'dinner', plan: MOCK_MEAL_PLAN.dinner },
    { key: 'snack', plan: MOCK_MEAL_PLAN.snack },
  ];

  const activeChallenge = MOCK_CHALLENGES.find(c => c.enrolled);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'bem-vindo'} 👋</Text>
            <Text style={styles.dateText}>{dayName}, {dateStr}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.textSecondary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Streak Banner */}
        <TouchableOpacity style={styles.streakBanner} activeOpacity={0.85}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakTitle}>{currentStreak} Dias Seguidos Cuidando de Ti!</Text>
              <Text style={styles.streakSub}>Continua assim — és incrível!</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>Manter</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalScanned}</Text>
            <Text style={styles.statLabel}>🍽️ Refeições</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <Text style={styles.statValue}>{dailyCaloriesConsumed}</Text>
            <Text style={styles.statLabel}>🔥 kcal hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { fontSize: FontSize.md }]}>{goalLabels[user?.goal || 'eat_healthy'].split(' ')[0]}</Text>
            <Text style={styles.statLabel}>🎯 Objectivo</Text>
          </View>
        </View>

        {/* Calorie Progress */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Calorias hoje</Text>
            <Text style={styles.calorieTotal}>{dailyCaloriesConsumed} / {calorieTarget} kcal</Text>
          </View>
          <View style={styles.calorieBar}>
            <View style={[styles.calorieBarFill, {
              width: `${caloriePercent * 100}%`,
              backgroundColor: caloriePercent > 0.9 ? Colors.danger : Colors.primary,
            }]} />
          </View>
          <View style={styles.macroRow}>
            <MacroTag label="Proteína" value="62g" color={Colors.protein} />
            <MacroTag label="Carbs" value="138g" color={Colors.carbs} />
            <MacroTag label="Gordura" value="48g" color={Colors.fat} />
            <MacroTag label="Fibras" value="18g" color={Colors.fiber} />
          </View>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity style={styles.scanCTA} onPress={() => router.push('/(tabs)/scan')} activeOpacity={0.85}>
          <View style={styles.scanCTAIcon}>
            <MaterialIcons name="camera-alt" size={28} color={Colors.textInverse} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanCTATitle}>Consultar Análise da Nossa Equipa</Text>
            <Text style={styles.scanCTADesc}>Fotografa a tua refeição e recebe a análise completa</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* Daily Expert Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipIconWrap}>
              <MaterialIcons name="lightbulb" size={18} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.tipLabel}>Dica do Especialista</Text>
              <Text style={styles.tipDate}>Hoje</Text>
            </View>
          </View>
          <Text style={styles.tipText}>"{dailyTip}"</Text>
        </View>

        {/* Active Challenge */}
        {activeChallenge ? (
          <View style={styles.challengeActiveCard}>
            <View style={styles.challengeActiveHeader}>
              <MaterialIcons name={activeChallenge.icon as any} size={20} color={activeChallenge.color} />
              <Text style={styles.challengeActiveTitle}>{activeChallenge.title}</Text>
              <Text style={[styles.challengeActiveDays, { color: activeChallenge.color }]}>
                {activeChallenge.daysCompleted}/{activeChallenge.totalDays} dias
              </Text>
            </View>
            <View style={styles.challengeBar}>
              <View style={[styles.challengeBarFill, {
                width: `${(activeChallenge.daysCompleted / activeChallenge.totalDays) * 100}%`,
                backgroundColor: activeChallenge.color,
              }]} />
            </View>
            <Text style={styles.challengeDesc}>{activeChallenge.description}</Text>
          </View>
        ) : null}

        {/* Today's Plan */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Plano de hoje</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/plan')}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 220, marginBottom: 4 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, alignItems: 'center' }}
          >
            {meals.map(({ key, plan }) => (
              <TouchableOpacity
                key={key}
                style={[styles.mealCard, selectedMeal === key && styles.mealCardSelected]}
                onPress={() => setSelectedMeal(key)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: MEAL_IMAGES[key] }}
                  style={styles.mealCardImage}
                  contentFit="cover"
                />
                <View style={styles.mealCardOverlay} />
                <View style={styles.mealCardContent}>
                  <Text style={styles.mealCardTime}>{MEAL_TIMES[key]}</Text>
                  <Text style={styles.mealCardLabel}>{MEAL_LABELS[key]}</Text>
                  <Text style={styles.mealCardName} numberOfLines={1}>{plan.name}</Text>
                  <Text style={styles.mealCardCals}>{plan.estimatedCalories} kcal</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Challenges Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Desafios de Hábito</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 140 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, alignItems: 'center' }}
          >
            {MOCK_CHALLENGES.map(challenge => (
              <TouchableOpacity key={challenge.id} style={[styles.challengeCard, { borderColor: challenge.color + '55' }]} activeOpacity={0.85}>
                <View style={[styles.challengeIconWrap, { backgroundColor: challenge.color + '22' }]}>
                  <MaterialIcons name={challenge.icon as any} size={22} color={challenge.color} />
                </View>
                <Text style={styles.challengeTitle} numberOfLines={1}>{challenge.title}</Text>
                <Text style={styles.challengeDuration}>{challenge.duration}</Text>
                {challenge.enrolled ? (
                  <View style={[styles.challengeEnrolledBadge, { backgroundColor: challenge.color + '22', borderColor: challenge.color }]}>
                    <Text style={[styles.challengeEnrolledText, { color: challenge.color }]}>Em progresso</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.challengeJoinBtn}>
                    <Text style={styles.challengeJoinText}>Participar</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Analyses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas análises</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {recentAnalyses.length === 0 ? (
            <View style={styles.emptyAnalyses}>
              <MaterialIcons name="camera-alt" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyAnalysesText}>Ainda sem análises. Fotografa a tua primeira refeição!</Text>
            </View>
          ) : recentAnalyses.map(a => (
            <TouchableOpacity
              key={a.id}
              style={styles.recentCard}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/analysis', params: { id: a.id } })}
            >
              <Image source={{ uri: a.imageUri }} style={styles.recentImage} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentDish} numberOfLines={1}>{a.dish}</Text>
                <Text style={styles.recentMeta}>{a.nutrients.calories} kcal · {MEAL_LABELS[a.meal]}</Text>
                <Text style={styles.recentTime}>{new Date(a.timestamp).toLocaleDateString('pt-BR')}</Text>
              </View>
              <View style={[styles.scoreBadge, {
                backgroundColor: a.score >= 85 ? Colors.primaryMuted : a.score >= 70 ? Colors.accentMuted : Colors.dangerMuted
              }]}>
                <Text style={[styles.scoreText, {
                  color: a.score >= 85 ? Colors.primary : a.score >= 70 ? Colors.accent : Colors.danger
                }]}>{a.score}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function MacroTag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.macroTag, { borderColor: color }]}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  dateText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  notifBtn: { position: 'relative', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  // Streak Banner
  streakBanner: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: Colors.primaryMuted, borderRadius: Radius.xl,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.primary + '66',
  },
  streakLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakFire: { fontSize: 32 },
  streakTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  streakSub: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  streakBadge: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  streakBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textInverse },
  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  statCardCenter: { borderColor: Colors.primaryDim, backgroundColor: Colors.primaryMuted },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  sectionCard: {
    marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  calorieTotal: { fontSize: FontSize.sm, color: Colors.textSecondary },
  calorieBar: { height: 8, backgroundColor: Colors.surfaceBorder, borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  calorieBarFill: { height: 8, borderRadius: 4 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroTag: {
    flex: 1, borderRadius: Radius.sm, paddingVertical: 6, paddingHorizontal: 8,
    alignItems: 'center', borderWidth: 1, gap: 2,
  },
  macroDot: { width: 6, height: 6, borderRadius: 3 },
  macroLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.medium },
  macroValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  scanCTA: {
    marginHorizontal: 20, marginBottom: 20, backgroundColor: Colors.primary,
    borderRadius: Radius.xl, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  scanCTAIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  scanCTATitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  scanCTADesc: { fontSize: FontSize.xs, color: 'rgba(0,0,0,0.6)', marginTop: 3 },
  // Daily Tip
  tipCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.accentMuted, borderRadius: Radius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.accent + '44',
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tipIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.accent + '22', alignItems: 'center', justifyContent: 'center',
  },
  tipLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.accent },
  tipDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  tipText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 21, fontStyle: 'italic' },
  // Active Challenge
  challengeActiveCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  challengeActiveHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  challengeActiveTitle: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  challengeActiveDays: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  challengeBar: { height: 6, backgroundColor: Colors.surfaceBorder, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  challengeBarFill: { height: 6, borderRadius: 3 },
  challengeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  // Meal Cards
  mealCard: {
    width: 150, height: 196, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent',
  },
  mealCardSelected: { borderColor: Colors.primary },
  mealCardImage: { width: 150, height: 196, position: 'absolute' },
  mealCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  mealCardContent: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  mealCardTime: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold, marginBottom: 2 },
  mealCardLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  mealCardName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 4 },
  mealCardCals: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.bold },
  // Challenges
  challengeCard: {
    width: 150, height: 120, backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 14, borderWidth: 1, justifyContent: 'space-between',
  },
  challengeIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  challengeTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 4 },
  challengeDuration: { fontSize: FontSize.xs, color: Colors.textMuted },
  challengeEnrolledBadge: {
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', borderWidth: 1,
  },
  challengeEnrolledText: { fontSize: 10, fontWeight: FontWeight.bold },
  challengeJoinBtn: {
    backgroundColor: Colors.primaryMuted, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.primary,
  },
  challengeJoinText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.primary },
  // Recent
  recentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 12,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  recentImage: { width: 64, height: 64, borderRadius: Radius.md },
  recentDish: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  recentMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 3 },
  recentTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  scoreBadge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: FontSize.base, fontWeight: FontWeight.extrabold },
  emptyAnalyses: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 24,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  emptyAnalysesText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
