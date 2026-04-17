import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { MOCK_MEAL_PLAN, MealSuggestion } from '@/constants/mockData';

const { width } = Dimensions.get('window');

const MEAL_IMAGES: Record<string, string> = {
  breakfast: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
  snack: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600',
};

const MEAL_META = {
  breakfast: { label: 'Café da manhã', icon: 'wb-sunny', time: '07:00', iconColor: Colors.accent },
  lunch: { label: 'Almoço', icon: 'light-mode', time: '12:30', iconColor: Colors.carbs },
  dinner: { label: 'Jantar', icon: 'nights-stay', time: '19:00', iconColor: Colors.fiber },
  snack: { label: 'Lanche', icon: 'coffee', time: '15:30', iconColor: Colors.protein },
};

type DayKey = 'today' | 'tomorrow' | 'aftertomorrow';
const DAYS: { key: DayKey; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'tomorrow', label: 'Amanhã' },
  { key: 'aftertomorrow', label: 'Depois' },
];

const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [selectedDay, setSelectedDay] = useState<DayKey>('today');
  const [expandedMeal, setExpandedMeal] = useState<string | null>('breakfast');

  const plan = MOCK_MEAL_PLAN;
  const totalCals = plan.breakfast.estimatedCalories + plan.lunch.estimatedCalories + plan.dinner.estimatedCalories + plan.snack.estimatedCalories;
  const target = user?.dailyCalorieTarget || 2000;

  const goalText: Record<string, string> = {
    lose_weight: 'Déficit calórico', gain_muscle: 'Superávit calórico',
    maintain: 'Manutenção', eat_healthy: 'Equilíbrio', manage_condition: 'Controle',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Plano alimentar</Text>
            <Text style={styles.headerSubtitle}>{goalText[user?.goal || 'eat_healthy']} · {target} kcal/dia</Text>
          </View>
          <TouchableOpacity style={styles.regenerateBtn}>
            <MaterialIcons name="refresh" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {DAYS.map(d => (
            <TouchableOpacity
              key={d.key}
              style={[styles.dayBtn, selectedDay === d.key && styles.dayBtnActive]}
              onPress={() => setSelectedDay(d.key)}
            >
              <Text style={[styles.dayBtnText, selectedDay === d.key && styles.dayBtnTextActive]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calorie Summary */}
        <View style={styles.calSummary}>
          <View style={styles.calRow}>
            <View>
              <Text style={styles.calValue}>{totalCals}</Text>
              <Text style={styles.calLabel}>kcal no plano</Text>
            </View>
            <View style={styles.calDivider} />
            <View>
              <Text style={styles.calValue}>{target}</Text>
              <Text style={styles.calLabel}>kcal objetivo</Text>
            </View>
            <View style={styles.calDivider} />
            <View>
              <Text style={[styles.calValue, { color: totalCals > target ? Colors.danger : Colors.primary }]}>
                {totalCals > target ? '+' : ''}{totalCals - target}
              </Text>
              <Text style={styles.calLabel}>diferença</Text>
            </View>
          </View>
          <View style={styles.calBar}>
            <View style={[styles.calBarFill, {
              width: `${Math.min(totalCals / target, 1) * 100}%`,
              backgroundColor: totalCals > target ? Colors.danger : Colors.primary,
            }]} />
          </View>
        </View>

        {/* Meals */}
        {MEAL_KEYS.map(key => {
          const meal: MealSuggestion = plan[key];
          const meta = MEAL_META[key];
          const isExpanded = expandedMeal === key;

          return (
            <View key={key} style={styles.mealSection}>
              <TouchableOpacity
                style={[styles.mealHeader, isExpanded && styles.mealHeaderExpanded]}
                onPress={() => setExpandedMeal(isExpanded ? null : key)}
                activeOpacity={0.85}
              >
                <View style={[styles.mealIconWrap, { backgroundColor: meta.iconColor + '22' }]}>
                  <MaterialIcons name={meta.icon as any} size={22} color={meta.iconColor} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.mealLabel}>{meta.label}</Text>
                  <Text style={styles.mealTime}>{meta.time}</Text>
                </View>
                <Text style={styles.mealCals}>{meal.estimatedCalories} kcal</Text>
                <MaterialIcons
                  name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={22} color={Colors.textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.mealBody}>
                  <Image
                    source={{ uri: MEAL_IMAGES[key] }}
                    style={styles.mealImage}
                    contentFit="cover"
                  />
                  <View style={styles.mealBodyContent}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealDesc}>{meal.description}</Text>
                    <View style={styles.mealTags}>
                      {meal.tags.map(tag => (
                        <View key={tag} style={styles.mealTag}>
                          <Text style={styles.mealTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.mealFooter}>
                      {meal.prepTime > 0 && (
                        <View style={styles.mealMeta}>
                          <MaterialIcons name="schedule" size={14} color={Colors.textSecondary} />
                          <Text style={styles.mealMetaText}>{meal.prepTime} min</Text>
                        </View>
                      )}
                      <TouchableOpacity style={styles.addBtn}>
                        <MaterialIcons name="add" size={16} color={Colors.textInverse} />
                        <Text style={styles.addBtnText}>Adicionar ao diário</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Nutrition Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={18} color={Colors.accent} />
            <Text style={styles.tipsTitle}>Dica do dia</Text>
          </View>
          <Text style={styles.tipText}>
            Beba pelo menos 2L de água ao longo do dia. A hidratação adequada melhora o metabolismo e reduz a sensação de fome.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  regenerateBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary,
  },
  daySelector: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4 },
  dayBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  dayBtnActive: { backgroundColor: Colors.primary },
  dayBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  dayBtnTextActive: { color: Colors.textInverse },
  calSummary: {
    marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  calRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  calValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  calLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  calDivider: { width: 1, height: 40, backgroundColor: Colors.surfaceBorder, flex: 0, marginHorizontal: 16 },
  calBar: { height: 6, backgroundColor: Colors.surfaceBorder, borderRadius: 3, overflow: 'hidden' },
  calBarFill: { height: 6, borderRadius: 3 },
  mealSection: { marginHorizontal: 20, marginBottom: 10 },
  mealHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  mealHeaderExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: Colors.background },
  mealIconWrap: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  mealLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  mealTime: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  mealCals: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, marginRight: 8 },
  mealBody: {
    backgroundColor: Colors.surface, borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg, overflow: 'hidden', borderWidth: 1,
    borderTopWidth: 0, borderColor: Colors.surfaceBorder,
  },
  mealImage: { width: '100%', height: 160 },
  mealBodyContent: { padding: 16 },
  mealName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 6 },
  mealDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  mealTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  mealTag: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.primary },
  mealTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  mealFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mealMetaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 14,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textInverse },
  tipsCard: {
    marginHorizontal: 20, marginTop: 10, backgroundColor: Colors.accentMuted,
    borderRadius: Radius.xl, padding: 18, borderWidth: 1, borderColor: Colors.accent + '44',
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.accent },
  tipText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
});
