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
  breakfast: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
  lunch: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
  dinner: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
  snack: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
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
  const [expandedMeal, setExpandedMeal] = useState<string | null>('lunch');

  const plan = MOCK_MEAL_PLAN;
  const totalCals = plan.breakfast.estimatedCalories + plan.lunch.estimatedCalories + plan.dinner.estimatedCalories + plan.snack.estimatedCalories;
  const target = user?.dailyCalorieTarget || 2000;

  const goalText: Record<string, string> = {
    lose_weight: 'Déficit calórico', gain_muscle: 'Superávit calórico',
    maintain: 'Manutenção', eat_healthy: 'Alimentação equilibrada', manage_condition: 'Controlo de saúde',
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
            <Text style={styles.regenerateBtnText}>Receber{'\n'}Plano</Text>
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
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.calValue}>{totalCals}</Text>
              <Text style={styles.calLabel}>kcal no plano</Text>
            </View>
            <View style={styles.calDivider} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.calValue}>{target}</Text>
              <Text style={styles.calLabel}>kcal objectivo</Text>
            </View>
            <View style={styles.calDivider} />
            <View style={{ flex: 1, alignItems: 'center' }}>
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
                    transition={300}
                  />
                  <View style={styles.mealBodyOverlay} />
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
                          <Text style={styles.mealMetaText}>{meal.prepTime} min preparo</Text>
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

        {/* Personalised Plan CTA */}
        <TouchableOpacity style={styles.planCTA} activeOpacity={0.85}>
          <MaterialIcons name="event-note" size={24} color={Colors.textInverse} />
          <View style={{ flex: 1 }}>
            <Text style={styles.planCTATitle}>Receber Plano Personalizado</Text>
            <Text style={styles.planCTADesc}>Plano semanal adaptado ao teu perfil e objectivos</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* Nutrition Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={18} color={Colors.accent} />
            <Text style={styles.tipsTitle}>Dica nutricional</Text>
          </View>
          <Text style={styles.tipText}>
            O Mufete angolano é considerado um dos pratos mais completos nutricionalmente! Rico em proteína do peixe, ferro do feijão e energia do funge — perfeito para um almoço de alta performance.
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
    alignItems: 'center', backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary, gap: 4,
  },
  regenerateBtnText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.primary, textAlign: 'center' },
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
  calDivider: { width: 1, height: 40, backgroundColor: Colors.surfaceBorder, marginHorizontal: 8 },
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
  mealImage: { width: '100%', height: 180 },
  mealBodyOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: 'rgba(0,0,0,0.2)' },
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
  planCTA: {
    marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.accent,
    borderRadius: Radius.xl, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  planCTATitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textInverse },
  planCTADesc: { fontSize: FontSize.xs, color: 'rgba(0,0,0,0.55)', marginTop: 3 },
  tipsCard: {
    marginHorizontal: 20, marginTop: 4, backgroundColor: Colors.accentMuted,
    borderRadius: Radius.xl, padding: 18, borderWidth: 1, borderColor: Colors.accent + '44',
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.accent },
  tipText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
});
