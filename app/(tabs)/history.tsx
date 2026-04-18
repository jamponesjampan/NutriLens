import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { FoodAnalysis } from '@/constants/mockData';

type Filter = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'breakfast', label: 'Café' },
  { key: 'lunch', label: 'Almoço' },
  { key: 'dinner', label: 'Jantar' },
  { key: 'snack', label: 'Lanche' },
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { analyses, currentStreak, totalScanned } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? analyses : analyses.filter(a => a.meal === filter);
  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length)
    : 0;

  const renderItem = ({ item }: { item: FoodAnalysis }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/analysis', params: { id: item.id } })}
    >
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} contentFit="cover" transition={200} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.scorePill, {
            backgroundColor: item.score >= 85 ? Colors.primaryMuted : item.score >= 70 ? Colors.accentMuted : Colors.dangerMuted,
          }]}>
            <Text style={[styles.scorePillText, {
              color: item.score >= 85 ? Colors.primary : item.score >= 70 ? Colors.accent : Colors.danger,
            }]}>{item.score} pts</Text>
          </View>
          <Text style={styles.mealTag}>{MEAL_LABELS[item.meal]}</Text>
        </View>
        <Text style={styles.dishName} numberOfLines={1}>{item.dish}</Text>
        <Text style={styles.cuisine}>{item.cuisine}</Text>
        <View style={styles.cardNutrients}>
          <NutrientChip icon="local-fire-department" value={`${item.nutrients.calories}`} unit="kcal" color={Colors.danger} />
          <NutrientChip icon="fitness-center" value={`${item.nutrients.protein}g`} unit="prot" color={Colors.protein} />
          <NutrientChip icon="bolt" value={`${item.nutrients.iron}mg`} unit="ferro" color={Colors.accent} />
        </View>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} style={{ alignSelf: 'center' }} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico</Text>
        <Text style={styles.headerSub}>O teu registo nutricional</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>dias{'\n'}seguidos</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMain]}>
          <Text style={styles.statEmoji}>🍽️</Text>
          <Text style={styles.statValue}>{totalScanned}</Text>
          <Text style={styles.statLabel}>refeições{'\n'}analisadas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>⭐</Text>
          <Text style={styles.statValue}>{avgScore}</Text>
          <Text style={styles.statLabel}>score{'\n'}médio</Text>
        </View>
      </View>

      {/* Iron highlight */}
      <View style={styles.ironBanner}>
        <MaterialIcons name="bolt" size={20} color={Colors.accent} />
        <Text style={styles.ironBannerText}>
          Ferro acumulado esta semana: <Text style={{ color: Colors.accent, fontWeight: FontWeight.bold }}>~28mg</Text> — Excelente para combater a anemia!
        </Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="restaurant" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma refeição encontrada</Text>
            <Text style={styles.emptySubtext}>Fotografa um prato para começar</Text>
          </View>
        }
      />
    </View>
  );
}

function NutrientChip({ icon, value, unit, color }: any) {
  return (
    <View style={[styles.nutrientChip, { borderColor: color + '44' }]}>
      <MaterialIcons name={icon} size={12} color={color} />
      <Text style={[styles.nutrientValue, { color }]}>{value}</Text>
      <Text style={styles.nutrientUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 3 },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, gap: 10 },
  statBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  statBoxMain: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  ironBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.accentMuted, borderRadius: Radius.lg,
    padding: 12, borderWidth: 1, borderColor: Colors.accent + '44',
  },
  ironBannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  filterChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterChipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  card: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.surfaceBorder, paddingRight: 12,
  },
  cardImage: { width: 90, height: 115 },
  cardBody: { flex: 1, padding: 12, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scorePill: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  scorePillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  mealTag: { fontSize: FontSize.xs, color: Colors.textMuted },
  dishName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  cuisine: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cardNutrients: { flexDirection: 'row', gap: 6, marginTop: 4 },
  nutrientChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1,
  },
  nutrientValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  nutrientUnit: { fontSize: 9, color: Colors.textMuted },
  timestamp: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  empty: { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textMuted },
});
