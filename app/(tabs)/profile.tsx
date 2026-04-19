import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal,
  TextInput, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { FamilyMember, ProfileType, UserGoal } from '@/constants/mockData';

const { width } = Dimensions.get('window');

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Perder peso', gain_muscle: 'Ganhar massa',
  maintain: 'Manter forma', eat_healthy: 'Comer melhor', manage_condition: 'Controlar saúde',
};

const DIET_LABELS: Record<string, string> = {
  omnivore: 'Onívoro', vegetarian: 'Vegetariano', vegan: 'Vegano',
  keto: 'Cetogênico', mediterranean: 'Mediterrâneo',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentário', light: 'Leve', moderate: 'Moderado',
  active: 'Activo', very_active: 'Muito activo',
};

const RESTRICTION_LABELS: Record<string, string> = {
  gluten: 'Glúten', lactose: 'Lactose', diabetes: 'Diabetes',
  hypertension: 'Hipertensão', none: 'Nenhuma',
};

const PROFILE_TYPE_CONFIG: Record<ProfileType, { emoji: string; label: string; color: string; voiceNote: string }> = {
  self: { emoji: '🧑', label: 'O meu plano', color: Colors.primary, voiceNote: 'Foco nos teus objectivos pessoais de saúde e energia.' },
  child: { emoji: '👶', label: 'Saúde do Filho(a)', color: '#38BDF8', voiceNote: 'Nutrição adaptada para crescimento e desenvolvimento saudável.' },
  elder: { emoji: '👴', label: 'Vitalidade do Avô/Avó', color: Colors.accent, voiceNote: 'Cuidados especiais para envelhecimento activo e qualidade de vida.' },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    user, logout, currentStreak, totalScanned, dailyCaloriesConsumed,
    familyMembers, activeMemberId, switchActiveMember, addFamilyMember,
    accessibilityMode, setAccessibilityMode,
  } = useApp();

  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberType, setNewMemberType] = useState<ProfileType>('child');

  const fs = (size: number) => accessibilityMode ? size * 1.2 : size;

  const bmi = user ? parseFloat((user.weight / Math.pow(user.height / 100, 2)).toFixed(1)) : null;
  const bmr = user ? Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5) : 0;

  const bmiCategory = bmi
    ? bmi < 18.5 ? { label: 'Abaixo do peso', color: Colors.info }
    : bmi < 25 ? { label: 'Peso saudável', color: Colors.primary }
    : bmi < 30 ? { label: 'Sobrepeso', color: Colors.accent }
    : { label: 'Obesidade', color: Colors.danger }
    : null;

  const activeMember = familyMembers.find(m => m.id === activeMemberId) || familyMembers[0];

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const config = PROFILE_TYPE_CONFIG[newMemberType];
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      profileType: newMemberType,
      emoji: config.emoji,
      color: config.color,
      goal: 'eat_healthy',
      restrictions: [],
      dailyCalorieTarget: newMemberType === 'child' ? 1600 : newMemberType === 'elder' ? 1800 : 2000,
    };
    addFamilyMember(newMember);
    setNewMemberName('');
    setShowFamilyModal(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: fs(FontSize.xxl) }]}>Perfil</Text>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialIcons name="edit" size={18} color={Colors.primary} />
            <Text style={[styles.editBtnText, { fontSize: fs(FontSize.sm) }]}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Family Switcher */}
        <View style={styles.familySection}>
          <Text style={[styles.familyLabel, { fontSize: fs(FontSize.xs) }]}>GERIR FAMÍLIA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
            {familyMembers.map(member => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.familyCard,
                  { borderColor: member.color },
                  activeMemberId === member.id && [styles.familyCardActive, { backgroundColor: member.color + '22' }],
                ]}
                onPress={() => switchActiveMember(member.id)}
              >
                <Text style={{ fontSize: 22 }}>{member.emoji}</Text>
                <Text style={[styles.familyCardName, { fontSize: fs(FontSize.xs), color: activeMemberId === member.id ? member.color : Colors.textSecondary }]}>
                  {member.name}
                </Text>
                {activeMemberId === member.id && (
                  <View style={[styles.activeIndicator, { backgroundColor: member.color }]} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addMemberBtn}
              onPress={() => setShowFamilyModal(true)}
            >
              <MaterialIcons name="add" size={22} color={Colors.textSecondary} />
              <Text style={[styles.addMemberText, { fontSize: fs(FontSize.xs) }]}>Adicionar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Active Member Voice Note */}
        {activeMember && (
          <View style={[styles.voiceNoteCard, { borderColor: PROFILE_TYPE_CONFIG[activeMember.profileType].color + '55' }]}>
            <Text style={{ fontSize: 20 }}>{PROFILE_TYPE_CONFIG[activeMember.profileType].emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.voiceNoteTitle, { fontSize: fs(FontSize.sm), color: PROFILE_TYPE_CONFIG[activeMember.profileType].color }]}>
                {PROFILE_TYPE_CONFIG[activeMember.profileType].label}
              </Text>
              <Text style={[styles.voiceNoteDesc, { fontSize: fs(FontSize.xs) }]}>
                {PROFILE_TYPE_CONFIG[activeMember.profileType].voiceNote}
              </Text>
            </View>
          </View>
        )}

        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, { fontSize: fs(FontSize.xxxl) }]}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            {/* Simple body silhouette indicator */}
            <View style={styles.bmiIndicator}>
              {bmiCategory && (
                <View style={[styles.bmiBadge, { backgroundColor: bmiCategory.color + '22', borderColor: bmiCategory.color }]}>
                  <MaterialIcons name="favorite" size={12} color={bmiCategory.color} />
                  <Text style={[styles.bmiBadgeText, { fontSize: fs(FontSize.xs), color: bmiCategory.color }]}>
                    {bmiCategory.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={[styles.userName, { fontSize: fs(FontSize.xxl) }]}>{user?.name || 'Utilizador'}</Text>
          <View style={styles.goalBadge}>
            <MaterialIcons name="flag" size={14} color={Colors.primary} />
            <Text style={[styles.goalBadgeText, { fontSize: fs(FontSize.sm) }]}>{GOAL_LABELS[user?.goal || 'eat_healthy']}</Text>
          </View>
        </View>

        {/* Body Stats */}
        <View style={styles.statsGrid}>
          <StatCell label="Peso" value={`${user?.weight || '--'}`} unit="kg" icon="monitor-weight" fs={fs} />
          <StatCell label="Altura" value={`${user?.height || '--'}`} unit="cm" icon="straighten" fs={fs} />
          <StatCell label="IMC" value={bmi?.toString() || '--'} unit="" icon="favorite" color={bmiCategory?.color} fs={fs} />
          <StatCell label="TMB" value={`${bmr}`} unit="kcal" icon="local-fire-department" fs={fs} />
        </View>

        {/* BMI Health Message */}
        {bmi && (bmi < 17 || bmi > 35) && (
          <View style={styles.empathyCard}>
            <MaterialIcons name="volunteer-activism" size={22} color={Colors.accent} />
            <Text style={[styles.empathyText, { fontSize: fs(FontSize.sm) }]}>
              Sentimos que o teu corpo precisa de uma atenção especial agora. Vamos ajustar o teu plano para recuperar a tua força com saúde. A nossa equipa está aqui para ti! 💚
            </Text>
          </View>
        )}

        {/* Streak & Activity */}
        <View style={styles.activityCard}>
          <Text style={[styles.activityTitle, { fontSize: fs(FontSize.md) }]}>A tua actividade</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={[styles.activityValue, { fontSize: fs(FontSize.md) }]}>🔥 {currentStreak}</Text>
              <Text style={[styles.activityLabel, { fontSize: fs(FontSize.xs) }]}>dias de streak</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={[styles.activityValue, { fontSize: fs(FontSize.md) }]}>📸 {totalScanned}</Text>
              <Text style={[styles.activityLabel, { fontSize: fs(FontSize.xs) }]}>refeições</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={[styles.activityValue, { fontSize: fs(FontSize.md) }]}>🎯 {dailyCaloriesConsumed}</Text>
              <Text style={[styles.activityLabel, { fontSize: fs(FontSize.xs) }]}>kcal hoje</Text>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoCard}>
          <Text style={[styles.infoCardTitle, { fontSize: fs(FontSize.md) }]}>Informações do perfil</Text>
          <InfoRow icon="restaurant-menu" label="Dieta" value={DIET_LABELS[user?.diet || 'omnivore']} fs={fs} />
          <InfoRow icon="fitness-center" label="Actividade" value={ACTIVITY_LABELS[user?.activity || 'moderate']} fs={fs} />
          <InfoRow icon="local-fire-department" label="Meta calórica" value={`${user?.dailyCalorieTarget || 2000} kcal/dia`} fs={fs} />
          <InfoRow icon="cake" label="Idade" value={`${user?.age || '--'} anos`} fs={fs} />
        </View>

        {/* Restrictions */}
        {user?.restrictions && user.restrictions.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={[styles.infoCardTitle, { fontSize: fs(FontSize.md) }]}>Restrições alimentares</Text>
            <View style={styles.restrictionsWrap}>
              {user.restrictions.map(r => (
                <View key={r} style={styles.restrictionTag}>
                  <MaterialIcons name="warning" size={12} color={Colors.warning} />
                  <Text style={[styles.restrictionText, { fontSize: fs(FontSize.xs) }]}>{RESTRICTION_LABELS[r]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Specialist Chat CTA */}
        <TouchableOpacity style={styles.chatCTA} onPress={() => router.push('/chat')} activeOpacity={0.85}>
          <View style={styles.chatCTAIcon}>
            <Text style={{ fontSize: 22 }}>👩🏾‍⚕️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chatCTATitle, { fontSize: fs(FontSize.md) }]}>Falar com os nossos Especialistas</Text>
            <Text style={[styles.chatCTADesc, { fontSize: fs(FontSize.xs) }]}>Equipa de nutricionistas disponível agora</Text>
          </View>
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={{ fontSize: fs(FontSize.xs), color: Colors.primary, fontWeight: FontWeight.bold }}>Online</Text>
          </View>
        </TouchableOpacity>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={[styles.infoCardTitle, { fontSize: fs(FontSize.md) }]}>Configurações</Text>
          <SettingRow
            icon="notifications"
            label="Notificações de refeição"
            hasSwitch
            switchValue={true}
            fs={fs}
          />
          <SettingRow
            icon="accessibility"
            label="Modo acessibilidade (letras maiores)"
            hasSwitch
            switchValue={accessibilityMode}
            onToggle={() => setAccessibilityMode(!accessibilityMode)}
            fs={fs}
          />
          <SettingRow icon="palette" label="Tema" value="Escuro" fs={fs} />
          <SettingRow icon="language" label="Idioma" value="Português (AO)" fs={fs} />
          <SettingRow icon="share" label="Partilhar app" fs={fs} />
          <SettingRow icon="star-rate" label="Avaliar na loja" fs={fs} />
        </View>

        {/* Report CTA */}
        <TouchableOpacity style={styles.reportBtn} activeOpacity={0.85}>
          <MaterialIcons name="picture-as-pdf" size={22} color={Colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.reportBtnTitle, { fontSize: fs(FontSize.md) }]}>Gerar Relatório de Saúde</Text>
            <Text style={[styles.reportBtnDesc, { fontSize: fs(FontSize.xs) }]}>Semanal ou mensal, pronto para o médico</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.accent} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialIcons name="logout" size={20} color={Colors.danger} />
          <Text style={[styles.logoutText, { fontSize: fs(FontSize.base) }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Family Member Modal */}
      <Modal visible={showFamilyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: fs(FontSize.lg) }]}>Adicionar membro da família</Text>
              <TouchableOpacity onPress={() => setShowFamilyModal(false)}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { fontSize: fs(FontSize.sm) }]}>Nome</Text>
            <TextInput
              style={[styles.modalInput, { fontSize: fs(FontSize.base) }]}
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="Ex: Maria, João..."
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={[styles.modalLabel, { fontSize: fs(FontSize.sm) }]}>Tipo de perfil</Text>
            {(['self', 'child', 'elder'] as ProfileType[]).map(type => {
              const cfg = PROFILE_TYPE_CONFIG[type];
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.profileTypeOption,
                    newMemberType === type && { borderColor: cfg.color, backgroundColor: cfg.color + '15' },
                  ]}
                  onPress={() => setNewMemberType(type)}
                >
                  <Text style={{ fontSize: 24 }}>{cfg.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.profileTypeLabel, { fontSize: fs(FontSize.sm), color: newMemberType === type ? cfg.color : Colors.textPrimary }]}>
                      {cfg.label}
                    </Text>
                    <Text style={[styles.profileTypeDesc, { fontSize: fs(FontSize.xs) }]}>{cfg.voiceNote}</Text>
                  </View>
                  {newMemberType === type && <MaterialIcons name="check-circle" size={20} color={cfg.color} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.modalConfirmBtn, !newMemberName.trim() && { opacity: 0.5 }]}
              onPress={handleAddMember}
              disabled={!newMemberName.trim()}
            >
              <Text style={[styles.modalConfirmText, { fontSize: fs(FontSize.base) }]}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatCell({ label, value, unit, icon, color, fs }: any) {
  return (
    <View style={[styles.statCell, color && { borderColor: color + '55' }]}>
      <MaterialIcons name={icon} size={18} color={color || Colors.primary} />
      <Text style={[styles.statValue, { fontSize: fs(FontSize.xl), color: color || Colors.textPrimary }]}>
        {value}<Text style={[styles.statUnit, { fontSize: fs(FontSize.sm) }]}> {unit}</Text>
      </Text>
      <Text style={[styles.statLabel, { fontSize: fs(FontSize.xs) }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, fs }: any) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={[styles.infoLabel, { fontSize: fs(FontSize.sm) }]}>{label}</Text>
      <Text style={[styles.infoValue, { fontSize: fs(FontSize.sm) }]}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value, hasSwitch, switchValue, onToggle, fs }: any) {
  return (
    <View style={styles.settingRow}>
      <MaterialIcons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={[styles.settingLabel, { fontSize: fs(FontSize.sm) }]}>{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onToggle}
          thumbColor={switchValue ? Colors.primary : Colors.textMuted}
          trackColor={{ true: Colors.primaryDim, false: Colors.surfaceBorder }}
        />
      ) : (
        <Text style={[styles.settingValue, { fontSize: fs(FontSize.sm) }]}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary },
  editBtnText: { color: Colors.primary, fontWeight: FontWeight.semibold },
  // Family
  familySection: { paddingHorizontal: 20, marginBottom: 12 },
  familyLabel: { color: Colors.textMuted, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: 10 },
  familyCard: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, gap: 4, position: 'relative', minWidth: 76,
  },
  familyCardActive: {},
  familyCardName: { fontWeight: FontWeight.semibold, textAlign: 'center' },
  activeIndicator: { position: 'absolute', bottom: -1, left: '25%', right: '25%', height: 2, borderRadius: 1 },
  addMemberBtn: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, gap: 4,
    borderWidth: 1.5, borderColor: Colors.surfaceBorder, borderStyle: 'dashed', minWidth: 76,
  },
  addMemberText: { color: Colors.textMuted, fontWeight: FontWeight.medium },
  voiceNoteCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginBottom: 12, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 12, borderWidth: 1,
  },
  voiceNoteTitle: { fontWeight: FontWeight.bold, marginBottom: 2 },
  voiceNoteDesc: { color: Colors.textSecondary, lineHeight: 18 },
  // Avatar
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.primary,
  },
  avatarText: { fontWeight: FontWeight.extrabold, color: Colors.primary },
  bmiIndicator: { marginTop: 8 },
  bmiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
  },
  bmiBadgeText: { fontWeight: FontWeight.bold },
  userName: { fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  goalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: Colors.primary },
  goalBadgeText: { color: Colors.primary, fontWeight: FontWeight.semibold },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, gap: 10, marginBottom: 16 },
  statCell: { width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.surfaceBorder },
  statValue: { fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  statUnit: { fontWeight: FontWeight.regular, color: Colors.textSecondary },
  statLabel: { color: Colors.textSecondary },
  // Empathy
  empathyCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.accentMuted,
    borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.accent + '44',
  },
  empathyText: { flex: 1, color: Colors.textSecondary, lineHeight: 22 },
  // Activity
  activityCard: { marginHorizontal: 20, backgroundColor: Colors.primaryMuted, borderRadius: Radius.xl, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.primary },
  activityTitle: { fontWeight: FontWeight.semibold, color: Colors.primary, marginBottom: 14 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityItem: { flex: 1, alignItems: 'center' },
  activityValue: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  activityLabel: { color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  activityDivider: { width: 1, height: 36, backgroundColor: Colors.primary + '44' },
  // Info
  infoCard: { marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
  infoCardTitle: { fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  infoLabel: { flex: 1, color: Colors.textPrimary },
  infoValue: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  restrictionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  restrictionTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accentMuted, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.accent },
  restrictionText: { color: Colors.accent, fontWeight: FontWeight.medium },
  // Chat CTA
  chatCTA: {
    marginHorizontal: 20, marginBottom: 12, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  chatCTAIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  chatCTATitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  chatCTADesc: { color: Colors.textSecondary, marginTop: 2 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  // Settings
  settingsCard: { marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  settingLabel: { flex: 1, color: Colors.textPrimary },
  settingValue: { color: Colors.textSecondary },
  // Report
  reportBtn: {
    marginHorizontal: 20, marginBottom: 12, backgroundColor: Colors.accentMuted,
    borderRadius: Radius.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: Colors.accent + '55',
  },
  reportBtnTitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  reportBtnDesc: { color: Colors.textSecondary, marginTop: 2 },
  // Logout
  logoutBtn: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.dangerMuted, borderRadius: Radius.full, paddingVertical: 14, borderWidth: 1, borderColor: Colors.danger + '44' },
  logoutText: { fontWeight: FontWeight.semibold, color: Colors.danger },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 24, gap: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalLabel: { color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: -6 },
  modalInput: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: 14,
    color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  profileTypeOption: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.surfaceBorder, gap: 4,
  },
  profileTypeLabel: { fontWeight: FontWeight.bold },
  profileTypeDesc: { color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  modalConfirmBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  modalConfirmText: { fontWeight: FontWeight.bold, color: Colors.textInverse },
});
