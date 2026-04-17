import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã', lunch: 'Almoço', dinner: 'Jantar', snack: 'Lanche',
};

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { analyses } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrients' | 'insights'>('overview');

  const analysis = analyses.find(a => a.id === id) || analyses[0];

  if (!analysis) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.textSecondary }}>Análise não encontrada</Text>
      </View>
    );
  }

  const scoreColor = analysis.score >= 85 ? Colors.primary : analysis.score >= 70 ? Colors.accent : Colors.danger;
  const n = analysis.nutrients;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: analysis.imageUri }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.mealBadge}>
              <Text style={styles.mealBadgeText}>{MEAL_LABELS[analysis.meal]}</Text>
            </View>
            <Text style={styles.heroTitle}>{analysis.dish}</Text>
            <Text style={styles.heroCuisine}>{analysis.cuisine}</Text>
          </View>
          {/* Score Circle */}
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{analysis.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>{analysis.scoreLabel}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['overview', 'nutrients', 'insights'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === 'overview' ? 'Visão geral' : t === 'nutrients' ? 'Nutrientes' : 'Insights'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Macros */}
            <Text style={styles.sectionLabel}>Macronutrientes</Text>
            <View style={styles.macrosCard}>
              <MacroBar label="Proteína" value={n.protein} max={60} unit="g" color={Colors.protein} icon="fitness-center" />
              <MacroBar label="Carboidratos" value={n.carbs} max={200} unit="g" color={Colors.carbs} icon="grain" />
              <MacroBar label="Gordura" value={n.fat} max={80} unit="g" color={Colors.fat} icon="opacity" />
              <MacroBar label="Fibras" value={n.fiber} max={30} unit="g" color={Colors.fiber} icon="eco" />
            </View>

            {/* Calories */}
            <View style={styles.calorieCard}>
              <MaterialIcons name="local-fire-department" size={32} color={Colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.calorieValue}>{n.calories} kcal</Text>
                <Text style={styles.calorieLabel}>nesta refeição</Text>
              </View>
              <View style={styles.caloriePct}>
                <Text style={styles.caloriePctValue}>~{Math.round(n.calories / 2000 * 100)}%</Text>
                <Text style={styles.caloriePctLabel}>da meta diária</Text>
              </View>
            </View>

            {/* Ingredients */}
            <Text style={styles.sectionLabel}>Ingredientes identificados</Text>
            <View style={styles.ingredientsWrap}>
              {analysis.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientChip}>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>

            {/* Recommendation */}
            <View style={styles.recCard}>
              <View style={styles.recHeader}>
                <MaterialIcons name="psychology" size={20} color={Colors.info} />
                <Text style={styles.recTitle}>Recomendação da IA</Text>
              </View>
              <Text style={styles.recText}>{analysis.recommendation}</Text>
            </View>
          </View>
        )}

        {activeTab === 'nutrients' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>Micronutrientes</Text>
            <View style={styles.nutrientsGrid}>
              <NutrientCard name="Ferro" value={n.iron} unit="mg" dv={18} icon="bolt" color={Colors.danger} />
              <NutrientCard name="Cálcio" value={n.calcium} unit="mg" dv={1000} icon="science" color={Colors.info} />
              <NutrientCard name="Vit. C" value={n.vitaminC} unit="mg" dv={90} icon="spa" color={Colors.carbs} />
              <NutrientCard name="Vit. D" value={n.vitaminD} unit="μg" dv={20} icon="wb-sunny" color={Colors.accent} />
              <NutrientCard name="Vit. B12" value={n.vitaminB12} unit="μg" dv={2.4} icon="medical-services" color={Colors.fiber} />
              <NutrientCard name="Potássio" value={n.potassium} unit="mg" dv={3500} icon="favorite" color={Colors.protein} />
              <NutrientCard name="Magnésio" value={n.magnesium} unit="mg" dv={420} icon="grain" color={Colors.fat} />
              <NutrientCard name="Sódio" value={n.sodium} unit="mg" dv={2300} icon="water-drop" color={Colors.info} />
            </View>
            <View style={styles.dvNote}>
              <Text style={styles.dvNoteText}>* % baseado nos valores diários de referência para adultos</Text>
            </View>
          </View>
        )}

        {activeTab === 'insights' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>Compatibilidade com perfil</Text>
            <View style={styles.compatCard}>
              <View style={[styles.compatScore, { backgroundColor: scoreColor + '22', borderColor: scoreColor }]}>
                <Text style={[styles.compatScoreText, { color: scoreColor }]}>{analysis.score}%</Text>
              </View>
              <Text style={styles.compatText}>{analysis.profileCompatibility}</Text>
            </View>

            {analysis.benefits.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Benefícios</Text>
                {analysis.benefits.map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>
                      <MaterialIcons name="check" size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </>
            )}

            {analysis.warnings.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Atenção</Text>
                {analysis.warnings.map((w, i) => (
                  <View key={i} style={styles.warningRow}>
                    <MaterialIcons name="warning" size={16} color={Colors.warning} />
                    <Text style={styles.warningText}>{w}</Text>
                  </View>
                ))}
              </>
            )}

            <View style={styles.recCard}>
              <View style={styles.recHeader}>
                <MaterialIcons name="tips-and-updates" size={20} color={Colors.accent} />
                <Text style={[styles.recTitle, { color: Colors.accent }]}>Dica personalizada</Text>
              </View>
              <Text style={styles.recText}>
                Com base no seu objetivo de {analysis.profileCompatibility.toLowerCase()}, este prato contribui positivamente para sua jornada. Continue escaneando suas refeições para acompanhar seu progresso!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MacroBar({ label, value, max, unit, color, icon }: any) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={styles.macroRow}>
      <MaterialIcons name={icon} size={16} color={color} />
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroBarWrap}>
        <View style={[styles.macroBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.macroValue, { color }]}>{value}{unit}</Text>
    </View>
  );
}

function NutrientCard({ name, value, unit, dv, icon, color }: any) {
  const pct = Math.min(Math.round((value / dv) * 100), 100);
  return (
    <View style={styles.nutrientCard}>
      <MaterialIcons name={icon} size={20} color={color} />
      <Text style={styles.nutrientName}>{name}</Text>
      <Text style={[styles.nutrientValue, { color }]}>{value}{unit}</Text>
      <View style={styles.nutrientBar}>
        <View style={[styles.nutrientBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.nutrientPct}>{pct}% VD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(13,17,23,0.7)', alignItems: 'center', justifyContent: 'center',
  },
  heroWrap: { position: 'relative', height: 280 },
  heroImage: { width: '100%', height: 280 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 90 },
  mealBadge: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: Colors.primary },
  mealBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 4 },
  heroCuisine: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  scoreCircle: {
    position: 'absolute', right: 16, bottom: 16,
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(13,17,23,0.8)', borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  scoreMax: { fontSize: FontSize.xs, color: Colors.textMuted },
  scoreLabel: { fontSize: 9, fontWeight: FontWeight.bold },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  tabTextActive: { color: Colors.textInverse },
  tabContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 12 },
  macrosCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 14 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroLabel: { width: 90, fontSize: FontSize.sm, color: Colors.textPrimary },
  macroBarWrap: { flex: 1, height: 6, backgroundColor: Colors.surfaceBorder, borderRadius: 3, overflow: 'hidden' },
  macroBarFill: { height: 6, borderRadius: 3 },
  macroValue: { width: 40, fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'right' },
  calorieCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.dangerMuted, borderRadius: Radius.xl,
    padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.danger + '44',
  },
  calorieValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  calorieLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  caloriePct: { alignItems: 'center' },
  caloriePctValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.danger },
  caloriePctLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  ingredientsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  ingredientChip: { backgroundColor: Colors.surfaceElevated, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.surfaceBorder },
  ingredientText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  recCard: { backgroundColor: Colors.infoMuted, borderRadius: Radius.xl, padding: 18, borderWidth: 1, borderColor: Colors.info + '44', marginBottom: 20 },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  recTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.info },
  recText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
  nutrientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  nutrientCard: {
    width: (width - 50) / 2, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 4,
  },
  nutrientName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  nutrientValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  nutrientBar: { height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  nutrientBarFill: { height: 4, borderRadius: 2 },
  nutrientPct: { fontSize: FontSize.xs, color: Colors.textMuted },
  dvNote: { marginBottom: 20 },
  dvNoteText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },
  compatCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.surfaceBorder, flexDirection: 'row', alignItems: 'center', gap: 16 },
  compatScore: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  compatScoreText: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  compatText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  benefitIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, backgroundColor: Colors.accentMuted, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.warning + '44' },
  warningText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
});
