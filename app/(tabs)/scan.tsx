import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { generateAnalysis } from '@/constants/mockData';

const { width } = Dimensions.get('window');

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_TYPES: { key: MealType; label: string; icon: string; time: string; example: string }[] = [
  { key: 'breakfast', label: 'Café da manhã', icon: 'wb-sunny', time: '7:00–10:00', example: 'Ex: Papaia, pão, ovos' },
  { key: 'lunch', label: 'Almoço', icon: 'light-mode', time: '11:30–14:00', example: 'Ex: Mufete, arroz e feijão' },
  { key: 'dinner', label: 'Jantar', icon: 'nights-stay', time: '18:00–21:00', example: 'Ex: Calulu, sopa' },
  { key: 'snack', label: 'Lanche', icon: 'coffee', time: 'Qualquer hora', example: 'Ex: Amendoim, fruta' },
];

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addAnalysis } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    startScanAnimation();

    await new Promise(r => setTimeout(r, 3200));

    const analysis = generateAnalysis(selectedImage, mealType);
    addAnalysis(analysis);
    setIsAnalyzing(false);
    router.push({ pathname: '/analysis', params: { id: analysis.id } });
  };

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analisar refeição</Text>
        <Text style={styles.headerSubtitle}>Fotografa o teu prato para uma análise completa</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Image Area */}
        <View style={styles.imageArea}>
          {selectedImage ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} contentFit="cover" />
              {isAnalyzing && (
                <View style={StyleSheet.absoluteFill}>
                  <View style={styles.scanOverlay}>
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
                    <View style={styles.scanCornerTL} />
                    <View style={styles.scanCornerTR} />
                    <View style={styles.scanCornerBL} />
                    <View style={styles.scanCornerBR} />
                  </View>
                  <View style={styles.analyzingBadge}>
                    <ActivityIndicator color={Colors.primary} size="small" />
                    <Text style={styles.analyzingText}>A nossa equipa está a analisar...</Text>
                  </View>
                </View>
              )}
              {!isAnalyzing && (
                <TouchableOpacity style={styles.changeImageBtn} onPress={() => setSelectedImage(null)}>
                  <MaterialIcons name="close" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyImageArea}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
              <View style={styles.emptyImageOverlay} />
              <View style={styles.emptyImageContent}>
                <View style={styles.cameraIconWrap}>
                  <MaterialIcons name="camera-alt" size={36} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Fotografa o teu prato</Text>
                <Text style={styles.emptyDesc}>Aponta a câmara para a refeição e recebe a análise nutricional completa em segundos</Text>
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.imageActionBtn} onPress={takePhoto}>
                    <MaterialIcons name="camera-alt" size={20} color={Colors.primary} />
                    <Text style={styles.imageActionLabel}>Câmara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.imageActionBtn, { borderColor: Colors.accent }]} onPress={pickFromGallery}>
                    <MaterialIcons name="photo-library" size={20} color={Colors.accent} />
                    <Text style={[styles.imageActionLabel, { color: Colors.accent }]}>Galeria</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tipo de refeição</Text>
          <View style={styles.mealTypeGrid}>
            {MEAL_TYPES.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.mealTypeBtn, mealType === m.key && styles.mealTypeBtnSelected]}
                onPress={() => setMealType(m.key)}
              >
                <MaterialIcons name={m.icon as any} size={20} color={mealType === m.key ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.mealTypeBtnLabel, mealType === m.key && { color: Colors.primary }]}>{m.label}</Text>
                <Text style={styles.mealTypeBtnTime}>{m.time}</Text>
                <Text style={styles.mealTypeBtnExample}>{m.example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Como obter a melhor análise</Text>
          {[
            { icon: 'wb-sunny', tip: 'Boa iluminação melhora muito a precisão' },
            { icon: 'crop-free', tip: 'Enquadra todo o prato na foto' },
            { icon: 'visibility', tip: 'Evita sombras ou reflexos' },
            { icon: 'restaurant', tip: 'Funciona com pratos angolanos e internacionais' },
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <MaterialIcons name={t.icon as any} size={16} color={Colors.primary} />
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>

        {/* Analyze Button */}
        {selectedImage && !isAnalyzing && (
          <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeImage} activeOpacity={0.85}>
            <MaterialIcons name="search" size={22} color={Colors.textInverse} />
            <Text style={styles.analyzeBtnText}>Consultar Análise da Nossa Equipa</Text>
          </TouchableOpacity>
        )}

        {!selectedImage && (
          <View style={styles.altActions}>
            <TouchableOpacity style={styles.altBtn} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={22} color={Colors.textInverse} />
              <Text style={styles.altBtnText}>Abrir câmara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.altBtn, styles.altBtnSecondary]} onPress={pickFromGallery}>
              <MaterialIcons name="photo-library" size={22} color={Colors.primary} />
              <Text style={[styles.altBtnText, { color: Colors.primary }]}>Identificar Produto Rapidamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  imageArea: { marginHorizontal: 20, marginBottom: 24 },
  imagePreviewWrap: { width: '100%', height: 260, borderRadius: Radius.xl, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: 260 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', overflow: 'hidden' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6 },
  scanCornerTL: { position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.primary, borderTopLeftRadius: 4 },
  scanCornerTR: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: Colors.primary, borderTopRightRadius: 4 },
  scanCornerBL: { position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: Colors.primary, borderBottomLeftRadius: 4 },
  scanCornerBR: { position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: Colors.primary, borderBottomRightRadius: 4 },
  analyzingBadge: {
    position: 'absolute', bottom: 16, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  analyzingText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  changeImageBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  emptyImageArea: {
    width: '100%', height: 270, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  emptyImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,17,23,0.72)' },
  emptyImageContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  cameraIconWrap: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    borderWidth: 2, borderColor: Colors.primary,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  emptyDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  imageActions: { flexDirection: 'row', gap: 14 },
  imageActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(13,17,23,0.7)', borderRadius: Radius.full,
    paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1.5, borderColor: Colors.primary,
  },
  imageActionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 12 },
  mealTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealTypeBtn: {
    width: (width - 50) / 2, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 3,
  },
  mealTypeBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  mealTypeBtnLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  mealTypeBtnTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  mealTypeBtnExample: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  tipsCard: {
    marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.surfaceBorder, gap: 10,
  },
  tipsTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  analyzeBtn: {
    marginHorizontal: 20, backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  analyzeBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textInverse },
  altActions: { paddingHorizontal: 20, gap: 12 },
  altBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  altBtnSecondary: {
    backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary,
  },
  altBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textInverse },
});
